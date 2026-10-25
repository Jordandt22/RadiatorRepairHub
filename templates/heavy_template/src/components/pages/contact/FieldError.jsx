/** Inline field message. Replaces the browser's native validation bubble. */
export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="m-0 text-sm font-medium text-accent-text">
      {message}
    </p>
  );
}
