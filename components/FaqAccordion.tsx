"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I book a flat or arrange a visit?",
    answer:
      "Open the flat you like, fill in the booking form with your details and preferred visit date, and send the request. The seller will contact you to confirm the visit and the next steps.",
  },
  {
    question: "Is a booking request the same as buying the flat?",
    answer:
      "No. A booking request only asks the seller to get in touch with you. It is not a purchase or a guaranteed reservation. A flat is sold only when you and the seller complete the deal between yourselves.",
  },
  {
    question: "Do I pay on the website?",
    answer:
      "No. We do not process payments for flats. Any payment is made directly between you and the seller, so please visit the property and verify the ownership papers before you pay anything.",
  },
  {
    question: "How can I contact the seller directly?",
    answer:
      "On each flat page you can call the seller or message them on WhatsApp. You can also see the status of all your requests, and the seller's contact details, on the My Bookings page.",
  },
  {
    question: "What does the SOLD label mean?",
    answer:
      "SOLD means the seller has completed the sale and the flat is no longer available. Flats still on sale are marked Available. A flat can show as Reserved while the seller is confirming a deal with another buyer.",
  },
  {
    question: "Can I review a flat?",
    answer:
      "Yes, if you bought it. Once the seller marks your purchase as completed, a 'Write a Review' button appears on the flat page and in My Bookings, so every review comes from a real buyer.",
  },
  {
    question: "How do I cancel a booking request?",
    answer:
      "Contact the seller using the phone or WhatsApp button on the flat page, or send us a message from the Contact page and we will help. You can follow the status of your request in My Bookings.",
  },
  {
    question: "How do I list my flat for sale?",
    answer:
      "Send us a message from the Contact page and choose 'Become a Seller'. Our team will set up your seller account, and you can then add flats and manage booking requests from your seller dashboard.",
  },
  {
    question: "How accurate is the home loan calculator?",
    answer:
      "The calculator on each flat page gives an estimate of your monthly installment from the price, down payment, interest rate and loan term. Your bank's actual rates and charges may be different.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "Send us a message from the Contact page, or use the email and phone number shown there. We reply within 24 hours.",
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

