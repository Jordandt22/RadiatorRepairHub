import React from "react";

function OpenStatus({ hours }) {
  // Check if business is currently open
  const getBusinessStatus = (hours) => {
    if (!hours || !Array.isArray(hours)) {
      return { isOpen: false, status: "Hours not available", color: "gray" };
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    // Find Current Day
    const todayHours = hours.find((day) => day.day_of_week === currentDay);

    // If business is closed today, return closed
    if (!todayHours || todayHours.is_closed) {
      return { isOpen: false, status: "Closed", color: "red" };
    }

    // Parse 24-hour format times (e.g., "08:00:00", "17:00:00")
    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(":");
      return parseInt(hours) * 60 + parseInt(minutes || 0);
    };

    try {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check if current time falls within any of the business hours periods
      const isOpen = todayHours.hours.some((period) => {
        const openMinutes = parseTime(period.open);
        const closeMinutes = parseTime(period.close);
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      });

      // If business is open, return open
      return {
        isOpen,
        status: isOpen ? "Open" : "Closed",
        color: isOpen ? "green" : "red",
      };
    } catch (error) {
      return { isOpen: false, status: "Hours Not Available", color: "gray" };
    }
  };

  const businessStatus = getBusinessStatus(hours);
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        businessStatus.color === "green"
          ? "bg-green-100 text-green-800"
          : businessStatus.color === "red"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          businessStatus.color === "green"
            ? "bg-green-500"
            : businessStatus.color === "red"
            ? "bg-red-500"
            : "bg-gray-500"
        }`}
      ></div>
      <span className="font-medium">{businessStatus.status}</span>
    </div>
  );
}

export default OpenStatus;
