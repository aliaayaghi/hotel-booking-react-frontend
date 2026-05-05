import React from "react";

export default function ErrorState({
  message = "We could not load the hotel search results.",
  onRetry,
}) {
  return (
    <section className="feedback-state feedback-state--error" role="alert">
      <p className="eyebrow">Search unavailable</p>
      <h2>Something went wrong</h2>
      <p>{message}</p>
      {onRetry ? (
        <button className="button button--primary" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </section>
  );
}
