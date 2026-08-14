"use client";

import OwnerEditButton from "@/components/businesses/OwnerEditButton";
import { useIsBusinessOwner } from "@/hooks/useIsBusinessOwner";

export default function BusinessSectionHeader({
  title,
  businessId,
  as: Tag = "h2",
  titleClassName = "text-xl md:text-2xl font-bold text-foreground font-heading",
  className = "mb-3 md:mb-4",
  trailing = null,
  onEdit,
}) {
  const { isOwner } = useIsBusinessOwner(businessId);

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <Tag className={titleClassName}>{title}</Tag>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {isOwner ? (
          <OwnerEditButton aria-label={`Edit ${title}`} onClick={onEdit} />
        ) : null}
      </div>
    </div>
  );
}
