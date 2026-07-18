import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pagination({
  page,
  totalPages,
  displayPage,
  isFetching,
  onPrevious,
  onNext,
}) {
  if (!totalPages || totalPages <= 0) return null;

  return (
    <div className="flex items-center gap-3">
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
  );
}
