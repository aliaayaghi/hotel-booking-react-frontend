import React from "react";

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="home-placeholder" aria-labelledby="home-title">
        <div className="home-placeholder__panel">
          <p className="home-placeholder__eyebrow">Hotel Booking</p>
          <h1 id="home-title" className="home-placeholder__title">
            Frontend foundation is ready.
          </h1>
          <p className="home-placeholder__copy">
            This placeholder keeps the first screen simple while routing, app
            providers, Axios, and React Query are prepared for future features.
          </p>
          <span className="home-placeholder__status">No backend requests yet</span>
        </div>
      </section>
    </main>
  );
}
