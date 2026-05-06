import React, { useState } from "react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "How do I make a booking?",
    a: "Search for hotels using the search bar on the homepage. Select a hotel, choose your dates and room, then click 'Book Now'. You'll need to be signed in to complete a booking. You can track all your bookings under My Bookings.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes. Go to My Bookings, find the booking you'd like to cancel, and click 'Cancel booking'. Cancellations are allowed for bookings in Pending or Confirmed status. Cancellation policies and any applicable charges depend on the hotel.",
  },
  {
    q: "How do I save a hotel for later?",
    a: "Click the heart icon on any hotel card or on the hotel details page. Saved hotels appear in your Saved Hotels list under your account menu. You can also add private notes to each saved hotel.",
  },
  {
    q: "I forgot my password. How do I reset it?",
    a: "On the Sign In page, use the 'Forgot password?' link to receive a reset email. If you don't see it in your inbox, check your spam folder. If you still have trouble, contact our support team.",
  },
  {
    q: "How do I update my personal information?",
    a: "Sign in and go to Account Settings from the dropdown menu in the top-right corner. You can update your name, phone number, nationality, and date of birth there. To change your password, use the Security section on the same page.",
  },
  {
    q: "Why is my booking showing as 'Pending'?",
    a: "After you submit a booking, it starts in Pending status while the hotel reviews and confirms it. You'll see the status update to Confirmed once the hotel accepts your reservation. This usually happens within a few hours.",
  },
  {
    q: "Can I book multiple rooms at once?",
    a: "Yes. When selecting a room on the hotel details page, you can increase the number of rooms in the booking form before confirming. Room availability is checked in real time.",
  },
  {
    q: "How do I contact a hotel directly?",
    a: "Each hotel's detail page shows the hotel's phone number, email, and website (if available). You'll find these in the hotel information section below the gallery.",
  },
  {
    q: "Is my payment information secure?",
    a: "We use industry-standard encryption for all transactions. Payment details are never stored on our servers. If you have concerns about a specific charge, contact our support team with your booking ID.",
  },
  {
    q: "How do I list my hotel on the platform?",
    a: "Create an account and choose 'Hotel Manager' as your account type during registration. Once approved by our admin team, you'll have access to the Manager Dashboard where you can add and manage your property.",
  },
];

const CONTACT = [
  { label: "General support", number: "+1 (800) 555-0100", hours: "Mon–Fri, 8 am–8 pm EST" },
  { label: "Booking help", number: "+1 (800) 555-0191", hours: "Mon–Sun, 24 hours" },
  { label: "Manager & property support", number: "+1 (800) 555-0182", hours: "Mon–Fri, 9 am–6 pm EST" },
  { label: "Urgent & travel emergencies", number: "+1 (800) 555-0155", hours: "24/7, always available" },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " faq-item--open" : ""}`}>
      <button
        type="button"
        className="faq-item__question"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="faq-item__chevron" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="faq-item__answer">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="public-page help-page">
      {/* Hero */}
      <div className="help-hero">
        <p className="eyebrow">Support centre</p>
        <h1 className="help-hero__title">How can we help you?</h1>
        <p className="help-hero__subtitle">
          Find answers to common questions below, or reach out to our team directly.
        </p>
      </div>

      {/* FAQ */}
      <section className="help-section">
        <h2 className="help-section__title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="help-section">
        <h2 className="help-section__title">Contact Us</h2>
        <div className="help-contact-grid">
          {CONTACT.map((c) => (
            <div key={c.label} className="help-contact-card">
              <p className="help-contact-card__label">{c.label}</p>
              <a href={`tel:${c.number.replace(/\s|\(|\)|-/g, "")}`} className="help-contact-card__number">
                {c.number}
              </a>
              <p className="help-contact-card__hours">{c.hours}</p>
            </div>
          ))}
        </div>

        <div className="help-email-row">
          <p>Prefer to write to us?</p>
          <a href="mailto:support@hotelbooking.com" className="help-email-link">
            support@hotelbooking.com
          </a>
        </div>
      </section>

      {/* Back link */}
      <div className="help-back">
        <Link to="/" className="button button--secondary">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
