-- Dedicated SMS outreach campaign types (separate from email A/B variants).
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'sms_claim_invite';
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'sms_claim_followup';
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'sms_custom_claim_invite';
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'sms_declined';
