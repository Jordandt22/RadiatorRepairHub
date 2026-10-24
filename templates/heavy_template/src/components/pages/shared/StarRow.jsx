function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="block">
      <path
        fill="currentColor"
        d="M12 2.6 14.7 8.3l6.3.9-4.5 4.4 1.1 6.2L12 16.9 6.4 19.8l1.1-6.2L3 9.2l6.3-.9L12 2.6z"
      />
    </svg>
  );
}

/** Five stars with the last one partially filled to match `rating`. */
export function StarRow({ rating }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <span className="relative block size-4.5" key={i}>
            <span className="block text-accent-soft">
              <StarIcon />
            </span>
            {fill > 0 ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden text-highlight"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
