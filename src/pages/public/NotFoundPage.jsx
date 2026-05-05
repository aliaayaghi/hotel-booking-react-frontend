import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="public-page public-page--narrow">
      <section className="content-panel" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">Page not found.</h1>
        <p>The route does not exist yet.</p>
        <Link to="/" className="button button--primary">
          Return home
        </Link>
      </section>
    </main>
  );
}
