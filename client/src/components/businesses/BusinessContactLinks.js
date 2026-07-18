"use client";

import Link from "next/link";
import { Phone, Mail, Globe, ExternalLink } from "lucide-react";
import { usePostHog } from "posthog-js/react";

export default function BusinessContactLinks({
  businessId,
  businessName,
  phone,
  email,
  website,
}) {
  const posthog = usePostHog();

  const capture = (event) => {
    posthog?.capture(event, {
      business_id: businessId || undefined,
      business_name: businessName || undefined,
    });
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {phone ? (
        <div className="flex items-center gap-2 md:gap-3">
          <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <a
            href={`tel:${phone}`}
            onClick={() => capture("business_phone_clicked")}
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-semibold"
          >
            {phone}
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 md:gap-3">
          <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-700">No Phone Number Available</span>
        </div>
      )}

      {email ? (
        <div className="flex items-center gap-2 md:gap-3">
          <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <a
            href={`mailto:${email}`}
            onClick={() => capture("business_email_clicked")}
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-semibold break-all"
          >
            {email}
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 md:gap-3">
          <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-700">No Email Available</span>
        </div>
      )}

      {website ? (
        <div className="flex items-center gap-2 md:gap-3">
          <Globe className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <Link
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => capture("business_website_clicked")}
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 break-all"
          >
            Visit Website
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 md:gap-3">
          <Globe className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-700">No Website Available</span>
        </div>
      )}
    </div>
  );
}
