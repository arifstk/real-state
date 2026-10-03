"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I make a reservation on LuxuryStays?",
    answer:
      "Search for your preferred destination, hotel, or room, select your check-in and check-out dates, choose your room type, and click 'Book Now' to complete your booking.",
  },
  {
    question: "Can I modify or cancel my booking?",
    answer:
      "Yes. You can manage your reservations directly from your user profile dashboard. Cancellation policies vary based on the room type and property selected.",
  },
  {
    question: "Are taxes and service fees included in the price?",
    answer:
      "All pricing displayed on the booking page explicitly breaks down base rates, taxes, and service fees before final payment confirmation.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We accept major credit cards, debit cards, and popular mobile payment gateways. Payment options are displayed during checkout.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can send us a message via the Contact page or reach out directly using our support email listed in your booking confirmation.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-800 hover:text-teal-600 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-600" : ""
                    }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

