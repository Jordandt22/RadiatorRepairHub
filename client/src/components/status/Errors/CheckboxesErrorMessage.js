import React from "react";

function CheckboxesErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="rounded-lg bg-muted p-4 md:col-span-2 lg:col-span-3 xl:col-span-4">
      <div className="mx-auto w-fit rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-center font-medium text-destructive">
        {message}
      </div>
    </div>
  );
}

export default CheckboxesErrorMessage;
