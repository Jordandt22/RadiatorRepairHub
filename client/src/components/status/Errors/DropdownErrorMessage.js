import React from "react";

function DropdownErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="flex justify-center items-center bg-red-500 text-white px-4 py-2 font-medium rounded-md text-center">
      {message}
    </div>
  );
}

export default DropdownErrorMessage;
