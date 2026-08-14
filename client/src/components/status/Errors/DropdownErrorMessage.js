import React from "react";

function DropdownErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-center font-medium text-destructive">
      {message}
    </div>
  );
}

export default DropdownErrorMessage;
