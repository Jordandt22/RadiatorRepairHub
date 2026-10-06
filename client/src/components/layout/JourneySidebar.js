/** Desktop rail Journey fills from the `.journey-sidebar` selector. */
export default function JourneySidebar() {
  return (
    <div className="relative hidden w-[300px] shrink-0 xl:block">
      <aside className="journey-sidebar absolute inset-0 overflow-hidden" />
    </div>
  );
}
