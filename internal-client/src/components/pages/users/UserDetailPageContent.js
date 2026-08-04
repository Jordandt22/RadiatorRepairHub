"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { Button } from "@/components/ui/button";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";
import UserClaimedBusinessesTable from "@/components/pages/users/UserClaimedBusinessesTable";
import UserDetailSkeleton from "@/components/pages/users/UserDetailSkeleton";
import UserRoleBadge from "@/components/pages/users/UserRoleBadge";

function DetailCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function UserDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const uid = params?.uid;
  const { accessToken, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-user", uid],
    enabled: Boolean(isReady && accessToken && uid),
    queryFn: async () => {
      const result = await fetchApi(`/admin/users/${uid}`, { accessToken });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error("User not found");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load user");
      }
      return result.data;
    },
    staleTime: 30_000,
  });

  if (!isReady || !accessToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <UserDetailSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/users" />}
        >
          <ArrowLeftIcon />
          Back to Users
        </Button>
        <p className="text-sm text-destructive">
          {error?.message || "User not found"}
        </p>
      </div>
    );
  }

  const businesses = data.businesses ?? [];

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-4 md:gap-10 md:px-8 md:py-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit cursor-pointer rounded-full px-2"
          nativeButton={false}
          render={<Link href="/users" />}
        >
          <ArrowLeftIcon />
          Back to Users
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
            {data.email ?? "User"}
          </h1>
          <UserRoleBadge role={data.role} />
        </div>
        <p className="font-mono text-sm text-muted-foreground break-all">
          {data.uid}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Account</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard label="Email">
            {data.email ? (
              <a
                href={`mailto:${data.email}`}
                className="break-all underline underline-offset-2"
              >
                {data.email}
              </a>
            ) : (
              "—"
            )}
          </DetailCard>
          <DetailCard label="UID">
            <span className="break-all font-mono text-xs">{data.uid}</span>
          </DetailCard>
          <DetailCard label="Role">
            <UserRoleBadge role={data.role} />
          </DetailCard>
          <DetailCard label="Created">
            {formatFullDate(data.created_at)}
          </DetailCard>
          <DetailCard label="Email confirmed">
            {formatFullDate(data.email_confirmed_at)}
          </DetailCard>
          <DetailCard label="Last sign in">
            {formatFullDate(data.last_sign_in_at)}
          </DetailCard>
          <DetailCard label="Phone">{data.phone || "—"}</DetailCard>
          <DetailCard label="Claimed businesses">
            <span className="tabular-nums">{data.claimed_count ?? 0}</span>
          </DetailCard>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Claimed businesses
          <span className="ml-2 font-normal text-muted-foreground">
            ({businesses.length})
          </span>
        </h2>
        <UserClaimedBusinessesTable businesses={businesses} />
      </section>
    </div>
  );
}
