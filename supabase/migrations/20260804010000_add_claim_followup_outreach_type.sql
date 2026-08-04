-- Claim follow-up outreach type (must commit before use in view)
ALTER TYPE "public"."outreach_type" ADD VALUE IF NOT EXISTS 'claim_followup';
