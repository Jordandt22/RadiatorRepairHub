import React from "react";

// Components
import BackOfCard from "./BackOfCard";

function BusinessHours({ business, setActiveCard }) {
  const formatBusinessHours = (openingHours) => {
    if (!openingHours || !Array.isArray(openingHours)) {
      return <p className="text-sm text-gray-500">Hours not available</p>;
    }

    return (
      <div className="space-y-1">
        {openingHours.map((day, index) => (
          <div key={index} className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">{day.day}</span>
            <div className="flex-col flex items-end">
              {day.hours.split(",").map((hour, index) => (
                <span key={index} className="text-gray-600">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BackOfCard title="Business Hours" setActiveCard={setActiveCard}>
      {formatBusinessHours(business.opening_hours)}
    </BackOfCard>
  );
}

export default BusinessHours;
