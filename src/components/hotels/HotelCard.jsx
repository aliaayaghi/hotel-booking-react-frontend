import React from "react";

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

function getHotelLocation(hotel) {
  return [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
}

function getStartingPrice(hotel) {
  return (
    hotel?.lowestPrice ??
    hotel?.startingPrice ??
    hotel?.minPrice ??
    hotel?.priceFrom ??
    hotel?.lowestRoomPrice ??
    hotel?.price
  );
}

function formatUsdPrice(price) {
  if (price === undefined || price === null || price === "") {
    return "";
  }

  const numericPrice = Number(price);

  if (!Number.isNaN(numericPrice)) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
      style: "currency",
    }).format(numericPrice);
  }

  return String(price).trim();
}

function getScoreLevel(score) {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return "medium";
  }

  const isFivePointScale = numericScore <= 5;

  if (isFivePointScale) {
    if (numericScore >= 4) {
      return "high";
    }

    if (numericScore >= 3) {
      return "medium";
    }

    return "low";
  }

  if (numericScore >= 8) {
    return "high";
  }

  if (numericScore >= 6) {
    return "medium";
  }

  return "low";
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
          ★
        </span>
      ))}
    </span>
  );
}

export default function HotelCard({ hotel }) {
  const image = getHotelImage(hotel);
  const location = getHotelLocation(hotel);
  const startingPrice = getStartingPrice(hotel);
  const priceLabel = formatUsdPrice(startingPrice);
  const rating = hotel?.starRating ?? hotel?.stars;
  const type = hotel?.type ?? hotel?.hotelType;
  const reviewScore = hotel?.averageRating ?? hotel?.rating;
  const scoreLevel = getScoreLevel(reviewScore);
  const overview = hotel?.overview ?? hotel?.description;

  return (
    <article className="hotel-card">
      <div className="hotel-card__media">
        {image ? (
          <img src={image} alt={hotel?.name ?? "Hotel"} />
        ) : (
          <div className="hotel-card__image-placeholder" aria-hidden="true">
            HB
          </div>
        )}
      </div>

      <div className="hotel-card__body">
        <div className="hotel-card__heading">
          <div>
            <h2>{hotel?.name ?? "Unnamed hotel"}</h2>
            {type ? <p className="hotel-card__type">{type}</p> : null}
            <StarRating rating={rating} />
          </div>
          {reviewScore ? (
            <span className={`hotel-card__score hotel-card__score--${scoreLevel}`}>
              {reviewScore}
            </span>
          ) : null}
        </div>

        {location ? <p className="hotel-card__location">{location}</p> : null}

        {overview ? <p className="hotel-card__overview">{overview}</p> : null}

        <div className="hotel-card__footer">
          <span className="hotel-card__review-note">
            {reviewScore ? "Guest review score" : "Review score needs backend verification"}
          </span>

          {priceLabel ? (
            <span className="hotel-card__price">{priceLabel}</span>
          ) : (
            <span className="hotel-card__price">Price needs backend verification</span>
          )}
        </div>
      </div>
    </article>
  );
}
