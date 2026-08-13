import React from "react";
import { Shield, Clock, Search } from "lucide-react";

function WhyChoose() {
  const items = [
    {
      title: "Verified business listings",
      description:
        "All shops are verified and regularly updated for accuracy",
      icon: Shield,
    },
    {
      title: "Updated contact info and hours",
      description: "Current phone numbers, addresses, and operating hours",
      icon: Clock,
    },
    {
      title: "Easy-to-use search and filters",
      description:
        "Find exactly what you need with our intuitive search tools",
      icon: Search,
    },
  ];

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
            Why Choose RadiatorRepairHub
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We make finding reliable radiator repair services simple and
            trustworthy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <IconComponent
                  className="w-6 h-6 text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;
