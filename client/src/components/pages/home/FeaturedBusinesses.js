import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import TopVerifiedBusinessesContent from "@/components/pages/home/TopVerifiedBusinessesContent";
import { fetchTopVerifiedBusinesses } from "@/lib/api/businesses";

async function TopVerifiedBusinesses() {
  try {
    const { data: businesses, error, status } = await fetchTopVerifiedBusinesses();

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message}
          link={{
            path: "/featured",
            text: "Go to featured businesses page",
          }}
        />
      );
    }

    return <TopVerifiedBusinessesContent businesses={businesses || []} />;
  } catch {
    return <TopVerifiedBusinessesContent businesses={[]} />;
  }
}

export default TopVerifiedBusinesses;
