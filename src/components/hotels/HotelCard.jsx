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

export default function HotelCard({ hotel }) {
  const image = getHotelImage(hotel);
  const location = getHotelLocation(hotel);
  const startingPrice = getStartingPrice(hotel);
  const rating = hotel?.starRating ?? hotel?.stars;
  const type = hotel?.type ?? hotel?.hotelType;
  const reviewScore = hotel?.averageRating ?? hotel?.rating;

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
            {type ? <span className="hotel-card__type">{type}</span> : null}
            <h2>{hotel?.name ?? "Unnamed hotel"}</h2>
          </div>
          {rating ? (
            <span className="hotel-card__rating">{rating} star hotel</span>
          ) : null}
        </div>

        {location ? <p className="hotel-card__location">{location}</p> : null}

        {hotel?.overview ?? hotel?.description ? (
          <p className="hotel-card__overview">
            {hotel.overview ?? hotel.description}
          </p>
        ) : null}

        <div className="hotel-card__footer">
          {reviewScore ? (
            <span className="hotel-card__score">Guest rating {reviewScore}</span>
          ) : (
            <span className="hotel-card__score">Rating needs backend verification</span>
          )}

          {startingPrice ? (
            <span className="hotel-card__price">From {startingPrice}</span>
          ) : (
            <span className="hotel-card__price">Price needs backend verification</span>
          )}
        </div>
      </div>
    </article>
  );
}
