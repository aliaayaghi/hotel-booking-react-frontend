import React from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import HotelSearchBar from "../../components/hotels/HotelSearchBar.jsx";
import {
  useHotelPhotos,
  usePublicHotels,
} from "../../features/hotels/hotelHooks.js";

const API_BASE_URL = "http://localhost:8080";

function getHotelsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.hotels)) {
    return data.hotels;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  return [];
}

function getHotelImage(hotel) {
  const firstPhoto = Array.isArray(hotel?.photos) ? hotel.photos[0] : null;

  return (
    hotel?.mainPhotoUrl ??
    hotel?.coverPhotoUrl ??
    hotel?.photoUrl ??
    hotel?.imageUrl ??
    firstPhoto?.url ??
    firstPhoto?.photoUrl ??
    ""
  );
}

function getPhotosFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.photos)) {
    return data.photos;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  return [];
}

function getPhotoUrl(photo) {
  if (typeof photo === "string") {
    return photo;
  }

  return photo?.url ?? photo?.photoUrl ?? photo?.imageUrl ?? "";
}

function normalizeImageUrl(url) {
  if (!url) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getHotelLocation(hotel) {
  return [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
}

function StarRating({ rating }) {
  const numericRating = Math.max(0, Math.min(5, Math.round(Number(rating))));

  if (!numericRating) {
    return null;
  }

  return (
    <span className="hotel-card__stars" aria-label={`${numericRating} star hotel`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          aria-hidden="true"
          className={index < numericRating ? "hotel-card__star--filled" : ""}
          key={index}
        >
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

function FeaturedHotelCard({ hotel }) {
  const hotelId = hotel?.id ?? hotel?.hotelId;
  const photosQuery = useHotelPhotos(hotelId);
  const photos = photosQuery.isSuccess ? getPhotosFromResponse(photosQuery.data) : [];
  const hotelName = hotel?.name ?? "Unnamed hotel";
  const firstPhotoUrl = photos.length > 0 ? getPhotoUrl(photos[0]) : "";
  const image = normalizeImageUrl(getHotelImage(hotel) || firstPhotoUrl);
  const location = getHotelLocation(hotel);
  const type = hotel?.type ?? hotel?.hotelType ?? "Hotel";
  const rating = hotel?.starRating ?? hotel?.stars;
  const detail = hotel?.overview ?? hotel?.description ?? hotel?.address ?? location;
  const detailsPath = hotelId ? `/hotels/${encodeURIComponent(hotelId)}` : "/search";

  return (
    <Link className="featured-card" to={detailsPath}>
      <div className="featured-card__image">
        {image ? <img src={image} alt={hotelName} /> : <span>{hotelName.slice(0, 2)}</span>}
      </div>
      <div className="featured-card__body">
        <div className="featured-card__meta">
          <StarRating rating={rating} />
        </div>
        <h3>{hotelName}</h3>
        {type ? <p className="featured-card__type">{type}</p> : null}
        {location ? <p>{location}</p> : null}
        {detail ? <p>{detail}</p> : null}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const featuredHotelsQuery = usePublicHotels({ page: 0, size: 10 });
  const featuredHotels = getHotelsFromResponse(featuredHotelsQuery.data).slice(0, 10);

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
          grid-auto-columns: minmax(280px, 340px);
          grid-auto-flow: column;
          grid-template-columns: none;
          gap: 20px;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          padding: 2px 0 16px;
          scroll-snap-type: x proximity;
          scrollbar-color: rgba(201, 162, 39, 0.72) rgba(31, 41, 55, 0.08);
          scrollbar-width: thin;
        }

        .featured-hotels::-webkit-scrollbar {
          height: 10px;
        }

        .featured-hotels::-webkit-scrollbar-track {
          border-radius: 999px;
          background: rgba(31, 41, 55, 0.08);
        }

        .featured-hotels::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.72);
        }

        .featured-card {
          display: block;
          scroll-snap-align: start;
          overflow: hidden;
          border: 1px solid rgba(31, 41, 55, 0.09);
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 18px 50px rgba(31, 41, 55, 0.08);
          text-decoration: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .featured-card:hover {
          border-color: rgba(201, 162, 39, 0.46);
          box-shadow: 0 22px 58px rgba(31, 41, 55, 0.12);
          transform: translateY(-2px);
        }

        .featured-card__image {
          display: grid;
          min-height: 190px;
          place-items: center;
          background:
            linear-gradient(135deg, rgba(31, 41, 55, 0.16), rgba(201, 162, 39, 0.18)),
            #f8f6f1;
          color: rgba(31, 41, 55, 0.34);
          font-size: 2rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .featured-card__image img {
          display: block;
          width: 100%;
          height: 190px;
          object-fit: cover;
        }

        .featured-card__body {
          padding: 20px;
        }

        .featured-card__meta {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          min-height: 22px;
          margin-bottom: 10px;
        }

        .featured-card h3 {
          margin: 0;
          color: #111827;
          font-size: 1.2rem;
        }

        .featured-card__type {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 0.92rem;
          font-weight: 650;
        }

        .featured-card p {
          margin: 10px 0 0;
          color: #4b5563;
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
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

          .home-benefits {
            grid-template-columns: 1fr;
          }

          .featured-hotels {
            grid-auto-columns: minmax(260px, 82vw);
          }
        }
      `}</style>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__inner">
          <div className="home-hero__content">
            <p className="home-hero__kicker">Find your stay</p>
            <h1 id="home-title">Book a calmer stay.</h1>
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
              Real active hotels from the backend, ready to open for details and
              room selection.
            </p>
          </div>
          <Link to="/search" className="button button--secondary">
            Open search
          </Link>
        </div>

        {featuredHotelsQuery.isLoading ? (
          <LoadingState message="Loading featured hotels from the backend." />
        ) : null}

        {featuredHotelsQuery.isError ? (
          <ErrorState
            message="We could not load featured hotels from the backend."
            onRetry={featuredHotelsQuery.refetch}
          />
        ) : null}

        {featuredHotelsQuery.isSuccess && featuredHotels.length === 0 ? (
          <EmptyState
            title="No featured hotels yet"
            message="No active hotels were returned by the backend."
          />
        ) : null}

        {featuredHotelsQuery.isSuccess && featuredHotels.length > 0 ? (
          <div className="featured-hotels">
            {featuredHotels.map((hotel, index) => (
              <FeaturedHotelCard
                hotel={hotel}
                key={hotel.id ?? hotel.hotelId ?? `${hotel.name}-${index}`}
              />
            ))}
          </div>
        ) : null}
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
