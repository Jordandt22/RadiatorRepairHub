import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../../helpers/customErrorHandler.js";
import { PHONE_LINE_TYPE_DEFAULT_LIMIT } from "../../lib/phoneLineType.js";
import { countUncheckedPhoneLineTypeBusinesses } from "../../supabase/supabase.functions.js";
import {
  deletePhoneLineTypeJobs,
  getPhoneLineTypeJob,
  hasActivePhoneLineTypeJob,
  listPhoneLineTypeJobs,
} from "../../phone-line-type/db.js";
import { startPhoneLineTypeJob } from "../../phone-line-type/startJob.js";

const { SERVER_ERROR, SUPABASE_ERROR, YUP_ERROR } = errorCodes;

function publicJob(job) {
  if (!job) return null;
  const { business_ids: _businessIds, ...rest } = job;
  return rest;
}

export const getPhoneLineTypePendingCount = async (req, res) => {
  try {
    const { count, error } = await countUncheckedPhoneLineTypeBusinesses();
    if (error) throw error;
    return res.status(200).json(successHandler({ pending_count: count }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error counting unchecked phone numbers.",
          error
        )
      );
  }
};

export const getPhoneLineTypeJobs = async (req, res) => {
  try {
    const jobs = await listPhoneLineTypeJobs();
    return res.status(200).json(successHandler({ jobs }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching phone line type jobs.",
          error
        )
      );
  }
};

export const getPhoneLineTypeJobById = async (req, res) => {
  try {
    const job = await getPhoneLineTypeJob(req.params.jobId);
    if (!job) {
      return res
        .status(404)
        .json(customErrorHandler(SUPABASE_ERROR, "Phone line type job not found."));
    }
    return res.status(200).json(successHandler({ job: publicJob(job) }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching the phone line type job.",
          error
        )
      );
  }
};

export const createPhoneLineTypeJobHandler = async (req, res) => {
  const limit =
    typeof req.body?.limit === "number" && Number.isFinite(req.body.limit)
      ? req.body.limit
      : PHONE_LINE_TYPE_DEFAULT_LIMIT;

  try {
    const active = await hasActivePhoneLineTypeJob();
    if (active) {
      return res
        .status(409)
        .json(
          customErrorHandler(
            YUP_ERROR,
            "A phone line type job is already pending or running."
          )
        );
    }

    const { job } = await startPhoneLineTypeJob({ limitCount: limit });
    return res.status(201).json(successHandler({ job: publicJob(job) }));
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SERVER_ERROR,
          "There was an error creating the phone line type job.",
          error
        )
      );
  }
};

export const deletePhoneLineTypeJobsHandler = async (req, res) => {
  const { job_ids } = req.body;

  try {
    const data = await deletePhoneLineTypeJobs(job_ids);
    return res.status(200).json(
      successHandler({
        deleted: data?.length ?? 0,
        ids: (data ?? []).map((row) => row.id),
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error deleting phone line type jobs.",
          error
        )
      );
  }
};
