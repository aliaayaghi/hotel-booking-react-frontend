import React from "react";

export default function EmptyState({
  title = "No hotels found",
  message = "Try adjusting the destination, dates, or filters.",
}) {
  return (
    <section className="feedback-state">
      <p className="eyebrow">No matches</p>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
