import React from "react";

function ContactHeader() {
  return (
    <div className="bg-slate-900 border-b border-gray-200 pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
          Contact Us
        </h1>
        <p className="text-lg text-gray-300 font-body max-w-3xl">
          Have a question about radiator repair services? Need help finding a
          repair shop? We&apos;re here to help connect you with trusted
          professionals in your area.
        </p>
      </div>
    </div>
  );
}

export default ContactHeader;
