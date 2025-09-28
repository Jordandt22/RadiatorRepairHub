import React from "react";
import Link from "next/link";
import { Mail, Clock, MessageCircle, ArrowRight } from "lucide-react";

function ContactSection() {
  return (
    <section className="py-20 mb-32 bg-white text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl text-gray-900 font-bold mb-4 font-heading">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Have questions about our radiator repair directory? We&apos;re here
            to help you find the perfect repair shop for your needs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="flex flex-col md:flex-row align-centers justify-center gap-4 md:gap-8 lg:gap-48 mb-12 md:mb-16">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">
                  Email Us
                </h3>
                <p className="text-gray-600 mb-2">Send us an email anytime</p>
                <a
                  href="mailto:contact@radiatorrepairhub.com"
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-300"
                >
                  contact@radiatorrepairhub.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">
                  Quick Response
                </h3>
                <p className="text-gray-600">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Contact Page Link */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 font-heading text-gray-900">
                Have a Question?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                <strong>Need help</strong> finding a radiator repair shop? Have{" "}
                <strong>questions</strong> about our services? Want to get your{" "}
                <strong>business listed</strong>? We&apos;re here to help you
                find the perfect repair solution for your vehicle.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <Link
                  href="/get-listed"
                  className="w-full flex justify-center align-center md:w-auto items-center px-8 py-2 border-2 rounded-full bg-none border-blue-500 text-blue-500 font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Get Listed</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full flex justify-center align-center md:w-auto items-center px-8 py-2 border-2 rounded-full border-blue-600 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
