import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pagination({
  page,
  totalPages,
  displayPage,
  total,
  isFetching,
  onPrevious,
  onNext,
}) {
  const showControls = totalPages > 0;
  const showTotal = total != null;

  if (!showControls && !showTotal) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        {showTotal ? `${Number(total).toLocaleString()} Total` : null}
      </p>
      {showControls ? (
        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={onPrevious}
          >
            <ChevronLeftIcon />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {displayPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={onNext}
          >
            Next
            <ChevronRightIcon />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
