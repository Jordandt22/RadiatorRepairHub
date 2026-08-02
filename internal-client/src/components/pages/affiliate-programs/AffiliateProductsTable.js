import { ImageIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/pages/dashboard/formatDate";
import AffiliateProductsEmptyState from "@/components/pages/affiliate-programs/AffiliateProductsEmptyState";
import AffiliateProductActiveBadge from "@/components/pages/affiliate-programs/AffiliateProductActiveBadge";
import AffiliateProductProviderBadge from "@/components/pages/affiliate-programs/AffiliateProductProviderBadge";

function LinkCell({ href }) {
  if (!href) return <span className="text-sm">—</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="block truncate text-sm text-blue-600 underline-offset-2 hover:underline hover:text-blue-700"
      title={href}
    >
      {href}
    </a>
  );
}

function ProductImage({ src, alt, className = "size-10" }) {
  if (!src) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground ${className}`}
        aria-hidden="true"
      >
        <ImageIcon className="size-4" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary affiliate image URLs
    <img
      src={src}
      alt={alt || ""}
      className={`shrink-0 rounded-md border border-border object-contain bg-background ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function AffiliateProductsTableView({
  products,
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
}) {
  const allSelected =
    products.length > 0 && products.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && products.some((row) => selectedIds.has(row.id));

  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={products.length === 0}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all affiliate products"
              />
            </TableHead>
            <TableHead className="w-14">Image</TableHead>
            <TableHead className="w-[20%]">Product</TableHead>
            <TableHead className="w-[9%]">Provider</TableHead>
            <TableHead className="w-[16%]">Product link</TableHead>
            <TableHead className="w-[16%]">Affiliate link</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[11%]">Created</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((row) => {
            const checked = selectedIds.has(row.id);
            return (
              <TableRow
                key={row.id}
                className="group"
                data-state={checked ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) =>
                      onToggleId(row.id, next === true)
                    }
                    aria-label={`Select ${row.title ?? "product"}`}
                  />
                </TableCell>
                <TableCell>
                  <ProductImage src={row.image_url} alt={row.title} />
                </TableCell>
                <TableCell className="max-w-0 font-medium">
                  <div className="min-w-0">
                    <span className="block truncate">{row.title ?? "—"}</span>
                    {row.description ? (
                      <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                        {row.description}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <AffiliateProductProviderBadge provider={row.provider} />
                </TableCell>
                <TableCell className="max-w-0">
                  <LinkCell href={row.product_link} />
                </TableCell>
                <TableCell className="max-w-0">
                  <LinkCell href={row.affiliate_link} />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <AffiliateProductActiveBadge
                    isActive={Boolean(row.is_active)}
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-95 focus-visible:opacity-100 focus-visible:scale-95"
                    onClick={() => onEditClick(row)}
                  >
                    <PencilIcon />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AffiliateProductsCardList({
  products,
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
}) {
  const allSelected =
    products.length > 0 && products.every((row) => selectedIds.has(row.id));
  const someSelected =
    !allSelected && products.some((row) => selectedIds.has(row.id));

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          disabled={products.length === 0}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Select all affiliate products"
        />
        <span className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>
      {products.map((row) => {
        const checked = selectedIds.has(row.id);
        return (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onToggleId(row.id, next === true)}
                aria-label={`Select ${row.title ?? "product"}`}
                className="mt-0.5"
              />
              <ProductImage
                src={row.image_url}
                alt={row.title}
                className="size-12"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.title ?? "—"}</p>
                {row.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {row.description}
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <AffiliateProductActiveBadge
                    isActive={Boolean(row.is_active)}
                  />
                  <AffiliateProductProviderBadge provider={row.provider} />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-8 text-sm">
              <dt className="text-muted-foreground">Product link</dt>
              <dd className="truncate">
                <LinkCell href={row.product_link} />
              </dd>
              <dt className="text-muted-foreground">Affiliate link</dt>
              <dd className="truncate">
                <LinkCell href={row.affiliate_link} />
              </dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(row.created_at)}</dd>
            </dl>
            <div className="pl-8">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => onEditClick(row)}
              >
                <PencilIcon />
                Edit
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AffiliateProductsTable({
  products = [],
  selectedIds,
  onToggleId,
  onToggleAll,
  onEditClick,
}) {
  if (!products.length) {
    return <AffiliateProductsEmptyState />;
  }

  return (
    <>
      <AffiliateProductsCardList
        products={products}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onEditClick={onEditClick}
      />
      <AffiliateProductsTableView
        products={products}
        selectedIds={selectedIds}
        onToggleId={onToggleId}
        onToggleAll={onToggleAll}
        onEditClick={onEditClick}
      />
    </>
  );
}
