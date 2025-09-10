import React from "react";

// Components
import HeroSearchBar from "./HeroSearchBar";

function HeroContext() {
  return (
    <section
      className="relative overflow-hidden py-16"
      style={{
        background:
          "linear-gradient(-45deg, #0f172a, #1e3a8a, #1e293b, #1e40af, #0f172a, #1e3a8a)",
        backgroundSize: "400% 400%",
        animation: "gradient-shift 12s ease infinite",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating radiator/car elements with varied animations */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
            <rect
              x="20"
              y="30"
              width="60"
              height="40"
              rx="5"
              fill="currentColor"
            />
            <rect
              x="30"
              y="40"
              width="40"
              height="20"
              rx="2"
              fill="currentColor"
            />
            <circle cx="25" cy="50" r="3" fill="currentColor" />
            <circle cx="75" cy="50" r="3" fill="currentColor" />
          </svg>
        </div>
        <div
          className="absolute top-40 right-20 w-12 h-12 opacity-15 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400">
            <rect
              x="20"
              y="30"
              width="60"
              height="40"
              rx="5"
              fill="currentColor"
            />
            <rect
              x="30"
              y="40"
              width="40"
              height="20"
              rx="2"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 opacity-10 animate-pulse-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-200">
            <rect
              x="20"
              y="30"
              width="60"
              height="40"
              rx="5"
              fill="currentColor"
            />
            <rect
              x="30"
              y="40"
              width="40"
              height="20"
              rx="2"
              fill="currentColor"
            />
            <circle cx="25" cy="50" r="3" fill="currentColor" />
            <circle cx="75" cy="50" r="3" fill="currentColor" />
          </svg>
        </div>
        <div
          className="absolute top-60 right-1/3 w-14 h-14 opacity-20 animate-bounce"
          style={{ animationDelay: "2s" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
            <rect
              x="20"
              y="30"
              width="60"
              height="40"
              rx="5"
              fill="currentColor"
            />
            <rect
              x="30"
              y="40"
              width="40"
              height="20"
              rx="2"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Additional floating elements */}
        <div
          className="absolute top-32 left-1/3 w-8 h-8 opacity-25 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400">
            <circle cx="50" cy="50" r="15" fill="currentColor" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
        <div
          className="absolute bottom-40 right-10 w-10 h-10 opacity-20 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-300">
            <rect
              x="30"
              y="30"
              width="40"
              height="40"
              rx="8"
              fill="currentColor"
            />
            <rect
              x="40"
              y="40"
              width="20"
              height="20"
              rx="4"
              fill="currentColor"
            />
          </svg>
        </div>
        <div
          className="absolute top-80 left-1/2 w-6 h-6 opacity-30 animate-bounce"
          style={{ animationDelay: "2.5s" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
            <polygon points="50,20 80,80 20,80" fill="currentColor" />
          </svg>
        </div>

        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/5 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/5 w-24 h-24 bg-blue-400/15 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-20 h-20 bg-blue-300/20 rounded-full blur-md animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Additional animated gradient orbs */}
        <div
          className="absolute top-1/6 left-1/3 w-40 h-40 rounded-full blur-2xl animate-gradient-rotate"
          style={{
            background:
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-1/6 right-1/3 w-36 h-36 rounded-full blur-xl animate-gradient-pulse"
          style={{
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute top-1/3 left-2/3 w-28 h-28 rounded-full blur-lg animate-drift"
          style={{
            background:
              "linear-gradient(225deg, rgba(37, 99, 235, 0.2), rgba(79, 70, 229, 0.2), rgba(37, 99, 235, 0.2))",
            animationDelay: "1.5s",
          }}
        ></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute top-1/3 left-1/6 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce"
          style={{ animationDelay: "0.3s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/6 w-1 h-1 bg-blue-300/40 rounded-full animate-bounce"
          style={{ animationDelay: "1.8s", animationDuration: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-blue-500/25 rounded-full animate-bounce"
          style={{ animationDelay: "2.2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute top-1/6 right-1/3 w-1 h-1 bg-blue-400/35 rounded-full animate-bounce"
          style={{ animationDelay: "0.8s", animationDuration: "2.8s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-10 font-heading">
            Find Trusted Radiator Repair
            <span className="block text-blue-300 mt-4">Services Near You</span>
          </h1>
          <p className="text-xl/8 text-gray-300 mb-16 max-w-3xl mx-auto font-body">
            Connect with certified radiator repair specialists in your area.
            Compare services, read reviews, and keep your vehicle running cool.
          </p>

          {/* Search Bar */}
          <HeroSearchBar />
        </div>
      </div>
    </section>
  );
}

export default HeroContext;
