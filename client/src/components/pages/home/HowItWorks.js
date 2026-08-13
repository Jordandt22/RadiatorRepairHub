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
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get connected with the right radiator repair specialist in just 4
            simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="w-10 h-10 bg-tint text-primary rounded-full flex items-center justify-center mb-4 text-lg font-semibold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
