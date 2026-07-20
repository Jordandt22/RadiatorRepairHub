import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import {
  getContactMessages as fetchContactMessages,
  updateContactMessagesStatus as updateMessagesStatus,
  updateContactMessagesArchived as updateMessagesArchived,
  markContactMessagesConfirmed as markMessagesConfirmed,
  getContactMessagesByIds,
  markContactMessagesSent,
} from "../../supabase/supabase.functions.js";
import {
  cacheData,
  getCacheData,
  getContactMessagesKey,
  deleteCacheDataByPrefix,
} from "../../redis/redis.js";
import { resendClient } from "../../resend/resend.js";
import { FREE_LEAD_CLAIM_OFFER_MESSAGE, buildBusinessClaimLink, SENDER_NAME } from "../../lib/constants/messages.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

export const loginAdmin = async (req, res) => {
  const { password } = req.body;
  const { ADMIN_PASSWORD, ADMIN_JWT_SECRET } = process.env;

  if (!ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Admin authentication is not configured."
        )
      );
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD);
  if (!isValid) {
    return res
      .status(401)
      .json(customErrorHandler(ACCESS_DENIED, "Invalid password"));
  }

  const secret = new TextEncoder().encode(ADMIN_JWT_SECRET);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return res.status(200).json(successHandler({ token }));
};

export const getContactMessages = async (req, res) => {
  let page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const status = req.query.status || null;
  const archived = req.query.archived === true || req.query.archived === "true";

  const { key, interval } = getContactMessagesKey(page, limit, status, archived);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchContactMessages(
    page,
    limit,
    status,
    archived
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          error
        )
      );
  }

  const total = count ?? 0;
  let totalPages = Math.ceil(total / limit);
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const compiledData = {
    contactMessages: data ?? [],
    total,
    totalPages,
    page,
    limit,
    status,
    archived,
  };

  await cacheData(key, interval, compiledData);
  return res.status(200).json(successHandler(compiledData));
};

export const updateContactMessagesStatus = async (req, res) => {
  const { status, contact_message_ids } = req.body;

  const { data, error } = await updateMessagesStatus(
    contact_message_ids,
    status
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact message statuses.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
    })
  );
};

export const updateContactMessagesArchived = async (req, res) => {
  const { archived, contact_message_ids } = req.body;

  const { data, error } = await updateMessagesArchived(
    contact_message_ids,
    archived
  );

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error updating contact message archive status.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      archived,
    })
  );
};

export const markContactMessagesConfirmed = async (req, res) => {
  const { contact_message_ids } = req.body;

  const { data: existing, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (existing ?? []).map((row) => [row.contact_message_id, row])
  );

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more contact messages could not be found."
          )
        );
    }

    if (message.confirmation_sent) {
      return res
        .status(422)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "One or more selected messages are already confirmed."
          )
        );
    }
  }

  const { data, error } = await markMessagesConfirmed(contact_message_ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error marking contact messages as confirmed.",
          error
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const contactMessageIds = (data ?? []).map(
    (row) => row.contact_message_id
  );

  return res.status(200).json(
    successHandler({
      updated: contactMessageIds.length,
      contactMessageIds,
      confirmation_sent: true,
    })
  );
};

export const sendContactMessages = async (req, res) => {
  const { contact_message_ids } = req.body;
  const { SENDER_EMAIL, TEST_RECIPIENT_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "Email sending is not configured."
        )
      );
  }

  if (
    process.env.NODE_ENV === "development" &&
    !TEST_RECIPIENT_EMAIL
  ) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "TEST_RECIPIENT_EMAIL is required in development."
        )
      );
  }

  const { data: messages, error: fetchError } = await getContactMessagesByIds(
    contact_message_ids
  );

  if (fetchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching contact messages.",
          fetchError
        )
      );
  }

  const byId = new Map(
    (messages ?? []).map((row) => [row.contact_message_id, row])
  );

  const skipped = [];
  const eligible = [];

  for (const id of contact_message_ids) {
    const message = byId.get(id);

    if (!message) {
      skipped.push({ id, reason: "not_found" });
      continue;
    }

    if (message.status !== "approved") {
      skipped.push({ id, reason: "not_approved" });
      continue;
    }

    const businessEmail =
      typeof message.business?.email === "string"
        ? message.business.email.trim()
        : "";

    if (!businessEmail) {
      skipped.push({ id, reason: "missing_business_email" });
      continue;
    }

    eligible.push({ message, businessEmail });
  }

  if (eligible.length === 0) {
    return res.status(200).json(
      successHandler({
        sent: [],
        skipped,
      })
    );
  }

  const batchPayload = eligible.map(({ message, businessEmail }) => ({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: [
      process.env.NODE_ENV === "development"
        ? TEST_RECIPIENT_EMAIL
        : businessEmail,
    ],
    subject: FREE_LEAD_CLAIM_OFFER_MESSAGE.subject,
    html: FREE_LEAD_CLAIM_OFFER_MESSAGE.html(
      message.business?.title,
      {
        name: message.name,
        phone: message.phone,
        email: message.email,
        vehicle: message.vehicle,
        issue: message.issue,
        urgency: message.urgency,
        additionalDetails: message.additional_details,
      },
      buildBusinessClaimLink(message.business?.slug)
    ),
  }));

  const { data: batchData, error: batchError } =
    await resendClient()?.batch?.send(batchPayload);

  if (batchError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          batchError.message || "Failed to send emails.",
          batchError
        )
      );
  }

  const sentIds = eligible.map(({ message }) => message.contact_message_id);

  const { data: updated, error: updateError } =
    await markContactMessagesSent(sentIds);

  if (updateError) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "Emails were sent but status could not be updated.",
          updateError
        )
      );
  }

  await deleteCacheDataByPrefix("CONTACT_MESSAGES");

  const resendResults = Array.isArray(batchData)
    ? batchData
    : batchData?.data ?? [];

  return res.status(200).json(
    successHandler({
      sent: (updated ?? []).map((row) => row.contact_message_id),
      skipped,
      resendIds: resendResults.map((item) => item.id).filter(Boolean),
    })
  );
};

const CACHE_RESOURCE_PREFIXES = {
  "contact-messages": "CONTACT_MESSAGES",
};

export const invalidateCache = async (req, res) => {
  const { resource } = req.body;
  const prefix = CACHE_RESOURCE_PREFIXES[resource];

  if (!prefix) {
    return res
      .status(400)
      .json(customErrorHandler(YUP_ERROR, "Invalid cache resource"));
  }

  await deleteCacheDataByPrefix(prefix);

  return res.status(200).json(
    successHandler({
      resource,
      invalidated: true,
    })
  );
};
