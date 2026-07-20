export function isMessageSelectable(message, isRowSelectable) {
  if (typeof isRowSelectable === "function") {
    return isRowSelectable(message);
  }
  return true;
}

export function getMessageSelectionState(
  messages,
  selectedIds,
  { maxSelectable = null, isRowSelectable = null } = {},
) {
  const selectableMessages = messages.filter((message) =>
    isMessageSelectable(message, isRowSelectable),
  );
  const selectableIds = selectableMessages.map(
    (message) => message.contact_message_id,
  );
  const selectedOnPage = selectableIds.filter((id) => selectedIds.has(id));
  const selectableCount =
    maxSelectable == null
      ? selectableIds.length
      : Math.min(selectableIds.length, maxSelectable);
  const allSelected =
    selectableCount > 0 && selectedOnPage.length >= selectableCount;
  const someSelected =
    selectedOnPage.length > 0 && selectedOnPage.length < selectableCount;
  const hasSelectableRows = selectableIds.length > 0;

  const isRowLocked = (message) =>
    !isMessageSelectable(message, isRowSelectable);

  const isSelectionBlocked = (message, isSelected) => {
    const rowLocked = isRowLocked(message);
    return (
      (rowLocked && !isSelected) ||
      (maxSelectable != null &&
        !isSelected &&
        selectedOnPage.length >= maxSelectable)
    );
  };

  return {
    selectableIds,
    selectedOnPage,
    selectableCount,
    allSelected,
    someSelected,
    hasSelectableRows,
    isRowLocked,
    isSelectionBlocked,
  };
}
