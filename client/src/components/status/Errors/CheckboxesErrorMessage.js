import React from "react";

function CheckboxesErrorMessage({ message = "Sorry, something went wrong." }) {
  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-slate-100 p-4 rounded-md">
      <div className="bg-red-500 text-white px-4 py-2 font-medium rounded-md text-center w-fit mx-auto">
        {message}
      </div>
    </div>
  );
}

export default CheckboxesErrorMessage;
