import React from "react";
import { Link } from "react-router-dom";

import HotelSearchBar from "../../components/hotels/HotelSearchBar.jsx";

const featuredHotels = [
  {
    name: "Harbor View Retreat",
    location: "Placeholder destination",
    detail: "Frontend-only featured hotel placeholder",
    tone: "City calm",
  },
  {
    name: "The Grand Courtyard",
    location: "Placeholder destination",
    detail: "Frontend-only featured hotel placeholder",
    tone: "Heritage stay",
  },
  {
    name: "Azure Garden Suites",
    location: "Placeholder destination",
    detail: "Frontend-only featured hotel placeholder",
    tone: "Quiet luxury",
  },
];

export default function HomePage() {
  return (
    <main className="public-page home-page">
      <style>{`
        .home-page {
          width: 100%;
          padding: 0;
        }

        .home-hero {
          position: relative;
          overflow: visible;
          padding: 46px min(5vw, 56px) 44px;
          background:
            linear-gradient(100deg, rgba(31, 41, 55, 0.94), rgba(31, 41, 55, 0.72)),
            linear-gradient(135deg, #8b7355, #f8f6f1);
          color: #ffffff;
        }

        .home-hero__inner,
        .home-section {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
        }

        .home-hero__content {
          max-width: 720px;
        }

        .home-hero__kicker {
          margin: 0 0 8px;
          color: #c9a227;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .home-hero h1 {
          max-width: 720px;
          margin: 0;
          color: #ffffff;
          font-size: clamp(2.2rem, 5.8vw, 4.5rem);
          line-height: 1.04;
        }

        .home-hero__copy {
          max-width: 600px;
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: 1.02rem;
        }

        .home-hero__search {
          margin-top: 28px;
        }

        .home-section {
          padding: 72px 0;
        }

        .home-section__header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .home-section h2 {
          margin: 0;
          color: #1f2937;
          font-size: clamp(1.8rem, 4vw, 3rem);
          line-height: 1.1;
        }

        .home-section__copy {
          max-width: 520px;
          margin: 10px 0 0;
          color: #4b5563;
        }

        .featured-hotels {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .featured-card {
          overflow: hidden;
          border: 1px solid rgba(31, 41, 55, 0.09);
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 18px 50px rgba(31, 41, 55, 0.08);
        }

        .featured-card__image {
          min-height: 190px;
          background:
            linear-gradient(135deg, rgba(31, 41, 55, 0.16), rgba(201, 162, 39, 0.18)),
            #f8f6f1;
        }

        .featured-card__body {
          padding: 20px;
        }

        .featured-card__tone {
          display: inline-flex;
          margin-bottom: 14px;
          padding: 7px 10px;
          border: 1px solid rgba(201, 162, 39, 0.34);
          border-radius: 999px;
          color: #1f2937;
          background: rgba(201, 162, 39, 0.12);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .featured-card h3 {
          margin: 0;
          color: #111827;
          font-size: 1.2rem;
        }

        .featured-card p {
          margin: 10px 0 0;
          color: #4b5563;
        }

        .home-benefits {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .home-benefit {
          padding: 22px;
          border-left: 3px solid #c9a227;
          background: rgba(255, 255, 255, 0.62);
        }

        .home-benefit h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .home-benefit p {
          margin: 8px 0 0;
          color: #4b5563;
        }

        @media (max-width: 980px) {
          .featured-hotels,
          .home-benefits {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .home-hero {
            padding: 34px 0 30px;
          }

          .home-section {
            padding: 48px 0;
          }

          .home-section__header {
            align-items: flex-start;
            flex-direction: column;
          }

          .featured-hotels,
          .home-benefits {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__inner">
          <div className="home-hero__content">
            <p className="home-hero__kicker">Find your stay</p>
            <h1 id="home-title">Book a calmer hotel stay.</h1>
            <p className="home-hero__copy">
              Search by city, dates, guests, rooms, and pet-friendly stays in one
              clear place.
            </p>
          </div>

          <div className="home-hero__search">
            <HotelSearchBar />
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="featured-hotels-title">
        <div className="home-section__header">
          <div>
            <p className="eyebrow">Featured stays</p>
            <h2 id="featured-hotels-title">Hotels to inspire the first search</h2>
            <p className="home-section__copy">
              Frontend-only placeholder cards. Real featured hotels will need
              backend verification before connecting data.
            </p>
          </div>
          <Link to="/search" className="button button--secondary">
            Open search
          </Link>
        </div>

        <div className="featured-hotels">
          {featuredHotels.map((hotel) => (
            <article className="featured-card" key={hotel.name}>
              <div className="featured-card__image" aria-hidden="true" />
              <div className="featured-card__body">
                <span className="featured-card__tone">{hotel.tone}</span>
                <h3>{hotel.name}</h3>
                <p>{hotel.location}</p>
                <p>{hotel.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="why-book-title">
        <div className="home-section__header">
          <div>
            <p className="eyebrow">Why book here</p>
            <h2 id="why-book-title">A quieter way to plan a stay</h2>
          </div>
        </div>

        <div className="home-benefits">
          <article className="home-benefit">
            <h3>Search that starts with essentials</h3>
            <p>Destination, dates, guests, and rooms stay front and center.</p>
          </article>
          <article className="home-benefit">
            <h3>Designed for real booking flows</h3>
            <p>Prepared for rooms, payments, reviews, and saved hotels later.</p>
          </article>
          <article className="home-benefit">
            <h3>Backend-aligned foundation</h3>
            <p>No API calls are made from this page until endpoints are wired.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
