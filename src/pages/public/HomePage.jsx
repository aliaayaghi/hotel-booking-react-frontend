import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="public-page">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">Frontend foundation</p>
        <h1 id="home-title">Hotel Booking</h1>
        <p className="hero__copy">
          A calm public homepage placeholder for the hotel booking experience.
          Search, hotel data, and booking APIs will be connected in later tasks.
        </p>
        <div className="hero__actions">
          <Link to="/about" className="button button--primary">
            About the project
          </Link>
          <Link to="/login" className="button button--secondary">
            Login placeholder
          </Link>
        </div>
      </section>
    </main>
  );
}
