/** Remounts on navigation so the route fade runs; layout chrome stays put. */
export default function Template({ children }) {
  return <div className="route-fade">{children}</div>;
}
