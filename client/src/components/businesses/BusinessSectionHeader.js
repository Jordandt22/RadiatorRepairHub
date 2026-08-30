"use client";

import OwnerEditButton from "@/components/businesses/OwnerEditButton";
import { useOwnerListingView } from "@/contexts/OwnerListingViewProvider";

export default function BusinessSectionHeader({
  title,
  businessId,
  as: Tag = "h2",
  titleClassName = "text-xl md:text-2xl font-bold text-foreground font-heading",
  className = "mb-3 md:mb-4",
  titleBadge = null,
  trailing = null,
  onEdit,
  editAriaLabel,
  editIcon,
}) {
  const { showOwnerChrome } = useOwnerListingView();

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <div className="flex min-w-0 items-center gap-2">
        <Tag className={titleClassName}>{title}</Tag>
        {titleBadge}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {showOwnerChrome && onEdit ? (
          <OwnerEditButton
            aria-label={editAriaLabel || `Edit ${title}`}
            onClick={onEdit}
            icon={editIcon}
          />
        ) : null}
      </div>
    </div>
  );
}
