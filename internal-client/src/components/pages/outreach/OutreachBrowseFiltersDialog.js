"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import BusinessTierCombobox from "@/components/pages/businesses/BusinessTierCombobox";
import {
  CLAIM_ELIGIBILITY_FILTERS,
  SENT_FILTERS,
  WEBSITE_FILTERS,
} from "@/components/pages/outreach/outreachConstants";

export default function OutreachBrowseFiltersDialog({
  open,
  onOpenChange,
  claimEligibility = null,
  websiteFilter = null,
  claimInviteSent = null,
  claimFollowupSent = null,
  websiteOfferSent = null,
  onApply,
}) {
  const [draftEligibility, setDraftEligibility] = useState(claimEligibility);
  const [draftWebsite, setDraftWebsite] = useState(websiteFilter);
  const [draftInvite, setDraftInvite] = useState(claimInviteSent);
  const [draftFollowup, setDraftFollowup] = useState(claimFollowupSent);
  const [draftOffer, setDraftOffer] = useState(websiteOfferSent);

  useEffect(() => {
    if (!open) return;
    setDraftEligibility(claimEligibility);
    setDraftWebsite(websiteFilter);
    setDraftInvite(claimInviteSent);
    setDraftFollowup(claimFollowupSent);
    setDraftOffer(websiteOfferSent);
  }, [
    open,
    claimEligibility,
    websiteFilter,
    claimInviteSent,
    claimFollowupSent,
    websiteOfferSent,
  ]);

  const handleApply = () => {
    onApply?.({
      eligibility: draftEligibility,
      website: draftWebsite,
      invite: draftInvite,
      followup: draftFollowup,
      offer: draftOffer,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDraftEligibility(null);
    setDraftWebsite(null);
    setDraftInvite(null);
    setDraftFollowup(null);
    setDraftOffer(null);
    onApply?.({
      eligibility: null,
      website: null,
      invite: null,
      followup: null,
      offer: null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Narrow the All list by eligibility, website, and sent status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="outreach-filter-eligibility">Eligibility</Label>
            <BusinessTierCombobox
              items={CLAIM_ELIGIBILITY_FILTERS}
              value={draftEligibility}
              onValueChange={setDraftEligibility}
              placeholder="All eligibility"
              ariaLabel="Filter by claim eligibility"
              inputName="rrh-outreach-eligibility-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outreach-filter-website">Website</Label>
            <BusinessTierCombobox
              items={WEBSITE_FILTERS}
              value={draftWebsite}
              onValueChange={setDraftWebsite}
              placeholder="All websites"
              ariaLabel="Filter by website"
              inputName="rrh-outreach-website-filter"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outreach-filter-invite">Claim invite</Label>
            <BusinessTierCombobox
              items={SENT_FILTERS}
              value={draftInvite}
              onValueChange={setDraftInvite}
              placeholder="Claim invite"
              ariaLabel="Filter by claim invite sent"
              inputName="rrh-outreach-claim-invite-sent"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outreach-filter-followup">Claim follow-up</Label>
            <BusinessTierCombobox
              items={SENT_FILTERS}
              value={draftFollowup}
              onValueChange={setDraftFollowup}
              placeholder="Claim follow-up"
              ariaLabel="Filter by claim follow-up sent"
              inputName="rrh-outreach-claim-followup-sent"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outreach-filter-offer">Website offer</Label>
            <BusinessTierCombobox
              items={SENT_FILTERS}
              value={draftOffer}
              onValueChange={setDraftOffer}
              placeholder="Website offer"
              ariaLabel="Filter by website offer sent"
              inputName="rrh-outreach-website-offer-sent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-full"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-full"
            onClick={handleApply}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
