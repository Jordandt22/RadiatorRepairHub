import React from "react";
import Link from "next/link";
import {
  Phone,
  CalendarDays,
  CreditCard,
  Wrench,
  Nfc,
  Car,
  Store,
  Toilet,
  Accessibility,
} from "lucide-react";

// Components
import BackOfCard from "./BackOfCard";

const featureIcons = {
  appointments_recommended: CalendarDays,
  credit_cards: CreditCard,
  debit_cards: CreditCard,
  mechanic: Wrench,
  nfc_mobile_payments: Nfc,
  oil_change: Car,
  onsite_services: Store,
  restroom: Toilet,
  wheelchair_accessible: Accessibility,
};

function BusinessInfo({ business, setActiveCard }) {
  const availableFeatures = [];
  Object.keys(business.features).forEach((key) => {
    if (business.features[key] === true) {
      availableFeatures.push({
        icon: featureIcons[key],
        value:
          key === "nfc_mobile_payments"
            ? "NFC Mobile Payments"
            : key.replace(/_/g, " "),
        path: key.replace(/_/g, "-"),
      });
    }
  });

  return (
    <BackOfCard title="Business Info" setActiveCard={setActiveCard}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-600" />
          <p className="text-sm text-gray-600">{business.phone}</p>
        </div>
        {availableFeatures.map((item) => (
          <Link
            className="flex items-center gap-2 group/feature"
            key={business.id + " " + item.value}
            href={`/feature/${item.path}`}
            prefetch={false}
          >
            <item.icon className="w-5 h-5 text-gray-600 group-hover/feature:text-blue-500" />
            <p className="text-sm text-gray-600 capitalize group-hover/feature:text-blue-500">
              {item.value}
            </p>
          </Link>
        ))}
      </div>
    </BackOfCard>
  );
}

export default BusinessInfo;
