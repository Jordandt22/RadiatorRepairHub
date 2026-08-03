# Outreach History Search

## Goal

Add a search bar to the Outreach page **History** tab so admins can find past sends by business title, slug, recipient, or subject — without leaving the paginated history list.

## Approach

Server-side `q` query param on `GET /admin/outreach/history`, matching the browse-tab search pattern (debounced client input → API filter → correct pagination totals).

## UI

- Add a search input to `OutreachHistoryActions`, visually matching browse (`SearchIcon` + rounded `Input`).
- Placeholder: `Search business, slug, recipient, subject…`
- `aria-label`: `Search outreach history`
- Keep existing campaign-type combobox and refresh button.
- Debounce **300ms** (same as browse / `SEARCH_DEBOUNCE_MS`).
- Changing search resets history to page 1.
- Empty results continue to use `OutreachEmptyState` with `hasFilters` true when search or type filter is active.

## Client data flow

In `OutreachPageContent`:

1. Add `historySearchInput` and `historyDebouncedSearch` state (parallel to browse search).
2. Debounce input → trim → `historySearchQuery`.
3. Include `historySearchQuery` in `historyQueryKey`.
4. Pass `q` to `/admin/outreach/history` when non-empty.
5. Wire `searchValue` / `onSearchChange` into `OutreachHistoryActions`.
6. Treat search as a filter for empty-state `hasFilters` (alongside `historyTypeId`).

## API

### Controller (`getOutreachHistoryList`)

- Read optional `q` from `req.query` (string, trimmed; empty → null).
- Pass `q` into `getOutreachHistory`.
- Echo `q` in the success payload (same style as `outreach_type`).

### Data layer (`getOutreachHistory`)

- Accept `{ outreachType, q }`.
- Keep existing `outreach_type` equality filter and `sent_at` desc order + range pagination.
- When `q` is present after `sanitizeAdminBusinessSearch`:
  - Match rows where **any** of these contain the pattern (case-insensitive):
    - `outreach_history.recipient`
    - `outreach_history.subject`
    - related `businesses.title`
    - related `businesses.slug`
  - Prefer a reliable PostgREST strategy: look up matching `businesses.id`s by title/slug `ilike`, then `.or()` on history for `recipient` / `subject` / `business_id.in.(…)`. If no businesses match, still filter on recipient/subject only.
- Type filter and search combine (AND).

## Out of scope

- Syncing search to the URL
- New DB indexes
- Client-only / current-page filtering
- Searching campaign type labels or metadata JSON

## Testing

- History with empty search behaves as today.
- Search by partial business title / slug / recipient / subject returns matching rows across pages.
- Campaign-type filter + search both apply.
- Empty search + empty type → unfiltered empty state copy; with either filter → filtered empty state copy.
- Debounce: rapid typing does not spam requests; final query uses trimmed value.
