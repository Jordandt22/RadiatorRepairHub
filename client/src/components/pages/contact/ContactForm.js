"use client";

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { Send } from "lucide-react";

// Contexts
import { useToast } from "@/contexts/ToastProvider";

const ContactForm = () => {
  const { showCustomSuccess, showCustomError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const subjectOptions = [
    "General Inquiry",
    "Feedback / Suggestions",
    "Report a Problem",
    "Advertising / Partnerships",
    "Business Listing Request",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided, should be valid)
    if (
      formData.phone.trim() &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = "Please select an inquiry type";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to check if a field is valid
  const isFieldValid = (fieldName) => {
    const fieldValue = formData[fieldName];

    switch (fieldName) {
      case "name":
        return fieldValue.trim().length >= 2;
      case "email":
        return (
          fieldValue.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)
        );
      case "phone":
        // Only show green if user has entered something AND it's valid
        return (
          fieldValue.trim() &&
          /^[\+]?[1-9][\d]{0,15}$/.test(fieldValue.replace(/[\s\-\(\)]/g, ""))
        );
      case "subject":
        return !!fieldValue;
      case "message":
        return fieldValue.trim().length >= 10;
      default:
        return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showCustomError(
        "Please fix the errors below before submitting.",
        "Validation Error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Send message to admin using message template
      const messageTemplateParams = {
        sender_name: formData.name,
        sender_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        sender_phone: formData.phone || "Not provided",
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_MSG_TEMPLATE_ID,
        messageTemplateParams,
        process.env.NEXT_PUBLIC_EMAILJS_API_KEY
      );

      // Success - clear form and show success message
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setErrors({});

      showCustomSuccess(
        "Thank you for your message! We'll get back to you within 24 hours.",
        "Message Sent Successfully"
      );
    } catch (error) {
      console.error("EmailJS Error:", error);
      showCustomError(
        "Sorry, there was an error sending your message. Please try again or contact us directly.",
        "Sending Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-t-5 border-blue-300 hover:border-blue-500 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">
        Send Us a Message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 hover:border-blue-500 outline-none transition-colors ${
              errors.name
                ? "border-red-500"
                : isFieldValid("name")
                ? "border-green-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address *
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 hover:border-blue-500 outline-none transition-colors ${
              errors.email
                ? "border-red-500"
                : isFieldValid("email")
                ? "border-green-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 hover:border-blue-500 outline-none transition-colors ${
              errors.phone
                ? "border-red-500"
                : isFieldValid("phone")
                ? "border-green-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your phone number (optional)"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Subject Dropdown */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Inquiry Type *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 hover:border-blue-500 outline-none transition-colors ${
              errors.subject
                ? "border-red-500"
                : isFieldValid("subject")
                ? "border-green-500"
                : "border-gray-300"
            }`}
          >
            <option value="">Select an inquiry type</option>
            {subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 hover:border-blue-500 outline-none resize-none transition-colors ${
              errors.message
                ? "border-red-500"
                : isFieldValid("message")
                ? "border-green-500"
                : "border-gray-300"
            }`}
            placeholder="Tell us how we can help you..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          {isSubmitting ? (
            <div className="w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold bg-gray-200 text-blue-500 transition-all duration-300 cursor-not-allowed">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-4"></div>
              Sending Message...
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={
                "w-full flex items-center justify-center px-6 py-4 rounded-lg font-semibold text-white transition-all duration-300 cursor-pointer bg-blue-600 hover:bg-blue-700 hover:scale-95 shadow-lg hover:shadow-xl"
              }
            >
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
