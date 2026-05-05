import React from "react";

export default function LoadingState({ message = "Loading results..." }) {
  return (
    <section className="feedback-state" aria-live="polite">
      <div className="feedback-state__spinner" aria-hidden="true" />
      <h2>Preparing your stay options</h2>
      <p>{message}</p>
    </section>
  );
}
