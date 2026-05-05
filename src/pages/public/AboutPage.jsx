import React from "react";

export default function AboutPage() {
  return (
    <main className="public-page public-page--narrow">
      <section className="content-panel" aria-labelledby="about-title">
        <p className="eyebrow">About</p>
        <h1 id="about-title">A modern hotel booking frontend.</h1>
        <p>
          This placeholder page reserves the public about route while the app
          foundation is being built. It does not call backend APIs.
        </p>
      </section>
    </main>
  );
}
