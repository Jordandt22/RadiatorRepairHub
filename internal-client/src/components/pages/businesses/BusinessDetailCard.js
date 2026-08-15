export default function BusinessDetailCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}
