import React from "react";

function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Search by city or state",
      description: "Enter your location to find nearby radiator repair shops",
    },
    {
      step: 2,
      title: "Browse business listings",
      description:
        "View detailed profiles with services, hours, and contact info",
    },
    {
      step: 3,
      title: "Compare reviews and ratings",
      description: "Read customer reviews and compare service quality",
    },
    {
      step: 4,
      title: "Contact the business",
      description:
        "Use Quick Contact on the business page, or call or visit the shop directly",
    },
  ];

  return (
    <section className="section-signature py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-white">
            How It Works
          </h2>
          <p className="mx-auto max-w-3xl text-base text-white/70 md:text-lg">
            Get connected with the right radiator repair specialist in just 4
            simple steps
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              {index < steps.length - 1 ? (
                <span
                  className="absolute top-5 left-16 hidden h-px bg-white/25 lg:block lg:right-[-12px]"
                  aria-hidden="true"
                />
              ) : null}
              <p className="mb-3 font-heading text-3xl font-bold tracking-tight text-white/90">
                {String(item.step).padStart(2, "0")}
              </p>
              <h3 className="mb-2 font-heading text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/65">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
