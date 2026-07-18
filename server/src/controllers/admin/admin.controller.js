import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import { getContactMessages as fetchContactMessages, updateContactMessagesStatus as updateMessagesStatus } from "../../supabase/supabase.functions.js";
import {
  cacheData,
  getCacheData,
  getContactMessagesKey,
  deleteCacheDataByPrefix,
} from "../../redis/redis.js";

const { ACCESS_DENIED, SERVER_ERROR, SUPABASE_ERROR } = errorCodes;

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

  const { key, interval } = getContactMessagesKey(page, limit, status);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  const { data, count, error } = await fetchContactMessages(page, limit, status);
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
