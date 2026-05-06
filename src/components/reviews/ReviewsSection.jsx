import React from "react";

function toArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const nestedItems =
    data.items ?? data.content ?? data.results ?? data.reviews;

  return Array.isArray(nestedItems) ? nestedItems : [];
}

function readValue(data, keys) {
  if (!data || typeof data !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = data[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
}

function getNumericValue(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : "";
}

function formatScore(score) {
  const numericScore = getNumericValue(score);

  if (numericScore === "") {
    return "";
  }

  return numericScore.toFixed(numericScore % 1 === 0 ? 0 : 1);
}

function getAverageScore(data) {
  if (typeof data === "number" || typeof data === "string") {
    return getNumericValue(data);
  }

  return getNumericValue(
    readValue(data, [
      "averageScore",
      "averageRating",
      "overallScore",
      "overallRating",
      "rating",
      "score",
    ]),
  );
}

function getReviewCount(reviewsData, scoresData) {
  const fromScores = getNumericValue(
    readValue(scoresData, ["reviewCount", "totalReviews", "count", "total"]),
  );

  if (fromScores !== "") {
    return fromScores;
  }

  if (!reviewsData || typeof reviewsData !== "object") {
    return "";
  }

  return getNumericValue(
    readValue(reviewsData, [
      "totalElements",
      "totalItems",
      "totalReviews",
      "reviewCount",
      "count",
      "total",
    ]),
  );
}

function getScoreBreakdown(data) {
  if (!data || typeof data !== "object") {
    return [];
  }

  const scoreKeys = [
    ["Cleanliness", ["cleanliness", "cleanlinessScore"]],
    ["Comfort", ["comfort", "comfortScore"]],
    ["Location", ["location", "locationScore"]],
    ["Service", ["service", "serviceScore", "staff", "staffScore"]],
    ["Facilities", ["facilities", "facilitiesScore"]],
    ["Value", ["value", "valueScore", "valueForMoney"]],
  ];

  return scoreKeys
    .map(([label, keys]) => ({
      label,
      value: formatScore(readValue(data, keys)),
    }))
    .filter((item) => item.value);
}

function getReviewRating(review) {
  return formatScore(
    readValue(review, [
      "rating",
      "score",
      "overallRating",
      "overallScore",
      "averageScore",
    ]),
  );
}

function isNotFound(query) {
  return query.isError && query.error?.response?.status === 404;
}

function getReviewerName(review) {
  return (
    readValue(review, ["customerName", "guestName", "reviewerName", "userName"]) ||
    readValue(review?.customer, ["name", "fullName"]) ||
    readValue(review?.user, ["name", "fullName"]) ||
    "Guest"
  );
}

function formatReviewDate(review) {
  const rawDate = readValue(review, [
    "createdAt",
    "createdDate",
    "reviewDate",
    "date",
  ]);

  if (!rawDate) {
    return "";
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return String(rawDate);
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ReviewCard({ review }) {
  const rating = getReviewRating(review);
  const title = readValue(review, ["title", "headline", "summary"]);
  const comment = readValue(review, ["comment", "content", "text", "review"]);
  const date = formatReviewDate(review);
  const reply = readValue(review, ["managerReply", "reply", "response"]);

  return (
    <article className="review-card">
      <header>
        <div>
          <h3>{getReviewerName(review)}</h3>
          {date ? <p>{date}</p> : null}
        </div>
        {rating ? <strong>{rating}</strong> : null}
      </header>

      {title ? <h4>{title}</h4> : null}
      {comment ? <p>{comment}</p> : <p>Review text needs backend verification.</p>}

      {reply ? (
        <div className="review-card__reply">
          <span>Hotel response</span>
          <p>{reply}</p>
        </div>
      ) : null}
    </article>
  );
}

export default function ReviewsSection({ averageScoresQuery, reviewsQuery }) {
  const reviews = reviewsQuery.isSuccess ? toArray(reviewsQuery.data) : [];
  const reviewsNotFound = isNotFound(reviewsQuery);
  const scoresNotFound = isNotFound(averageScoresQuery);
  const averageScore = averageScoresQuery.isSuccess
    ? getAverageScore(averageScoresQuery.data)
    : "";
  const reviewCount =
    reviewsQuery.isSuccess || averageScoresQuery.isSuccess
      ? getReviewCount(reviewsQuery.data, averageScoresQuery.data)
      : "";
  const scoreBreakdown = averageScoresQuery.isSuccess
    ? getScoreBreakdown(averageScoresQuery.data)
    : [];

  return (
    <section
      className="hotel-details-section hotel-info-section reviews-section"
      id="reviews"
      aria-labelledby="hotel-reviews-title"
    >
      <div className="reviews-section__heading">
        <div className="hotel-info-section__heading">
          <p className="eyebrow">Reviews</p>
          <h2 id="hotel-reviews-title">Guest reviews</h2>
        </div>

        {averageScore !== "" ? (
          <div className="reviews-summary">
            <strong>{formatScore(averageScore)}</strong>
            <span>
              Average score
              {reviewCount !== "" ? <small>{reviewCount} reviews</small> : null}
            </span>
          </div>
        ) : null}
      </div>

      {averageScoresQuery.isLoading || reviewsQuery.isLoading ? (
        <div className="hotel-info-section__state">
          Loading guest reviews from the backend.
        </div>
      ) : null}

      {averageScoresQuery.isError && !scoresNotFound ? (
        <div className="hotel-info-section__state">
          Average review scores could not be loaded.
        </div>
      ) : null}

      {reviewsQuery.isError && !reviewsNotFound ? (
        <div className="hotel-info-section__state">
          Reviews could not be loaded.
        </div>
      ) : null}

      {scoreBreakdown.length ? (
        <dl className="reviews-score-grid">
          {scoreBreakdown.map((score) => (
            <div key={score.label}>
              <dt>{score.label}</dt>
              <dd>{score.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {reviewsQuery.isSuccess && reviews.length ? (
        <div className="review-list">
          {reviews.map((review, index) => (
            <ReviewCard
              key={review?.id ?? review?.reviewId ?? index}
              review={review}
            />
          ))}
        </div>
      ) : null}

      {reviewsNotFound || (reviewsQuery.isSuccess && !reviews.length) ? (
        <div className="hotel-info-section__empty">
          No guest reviews are available for this hotel yet.
        </div>
      ) : null}
    </section>
  );
}
