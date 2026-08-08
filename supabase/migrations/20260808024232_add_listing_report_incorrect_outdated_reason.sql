-- Allow Report Info submissions for incorrect / outdated listing info
ALTER TYPE "public"."listing_report_reasons" ADD VALUE IF NOT EXISTS 'incorrect_outdated';
