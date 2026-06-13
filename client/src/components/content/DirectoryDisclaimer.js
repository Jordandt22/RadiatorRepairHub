import React from "react";
import Link from "next/link";

function DirectoryDisclaimer({ className = "mt-12" }) {
  return (
    <section className={className} aria-label="Directory disclaimer">
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-8">
        <p className="text-gray-700 leading-relaxed mb-4">
          <strong>Please note:</strong> RadiatorRepairHub is a business
          directory only. We do not provide radiator repair services,
          estimates, or appointments.
        </p>
        <p className="text-gray-700 leading-relaxed mb-3">
          If you need actual service, please:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-2">
          <li>
            <Link
              href="/search"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Use our search
            </Link>{" "}
            to find shops near you
          </li>
          <li>
            Contact the business directly using their listed contact information
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          Feel free to contact us and we can help you find services near you!
        </p>
      </div>
    </section>
  );
}

export default DirectoryDisclaimer;
