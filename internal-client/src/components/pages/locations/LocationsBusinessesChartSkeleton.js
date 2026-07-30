import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function LocationsBusinessesChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center gap-2 pb-0">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <Skeleton className="size-[200px] rounded-full" />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Skeleton className="h-4 w-64" />
      </CardFooter>
    </Card>
  );
}
