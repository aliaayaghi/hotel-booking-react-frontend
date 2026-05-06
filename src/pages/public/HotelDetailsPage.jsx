import React from "react";
import { useParams } from "react-router-dom";

export default function HotelDetailsPage() {
  const { hotelId } = useParams();

  return (
    <main className="public-page public-page--narrow">
      <section className="content-panel" aria-labelledby="hotel-details-title">
        <p className="eyebrow">Hotel</p>
        <h1 id="hotel-details-title">Hotel details page</h1>
        <p>Hotel ID: {hotelId}</p>
      </section>
    </main>
  );
}
