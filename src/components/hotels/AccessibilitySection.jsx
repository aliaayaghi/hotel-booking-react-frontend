import React from "react";

function toArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const nestedItems =
    data.items ??
    data.content ??
    data.results ??
    data.features ??
    data.accessibilityFeatures;

  if (Array.isArray(nestedItems)) {
    return nestedItems;
  }

  if (
    data.name ||
    data.featureName ||
    data.title ||
    data.label ||
    data.description
  ) {
    return [data];
  }

  return [];
}

function getFeatureName(feature) {
  if (typeof feature === "string") {
    return feature;
  }

  return (
    feature?.name ??
    feature?.featureName ??
    feature?.title ??
    feature?.label ??
    feature?.description ??
    ""
  );
}

function getFeatureDetail(feature) {
  if (!feature || typeof feature !== "object") {
    return "";
  }

  return feature.category ?? feature.type ?? feature.notes ?? "";
}

function getAccessibilityFeatures(data) {
  return toArray(data)
    .map((feature, index) => ({
      detail: getFeatureDetail(feature),
      id: feature?.id ?? feature?.featureId ?? getFeatureName(feature) ?? index,
      name: getFeatureName(feature),
    }))
    .filter((feature) => feature.name);
}

function isNotFound(query) {
  return query.isError && query.error?.response?.status === 404;
}

export default function AccessibilitySection({ accessibilityQuery }) {
  const features = accessibilityQuery.isSuccess
    ? getAccessibilityFeatures(accessibilityQuery.data)
    : [];
  const hasNoFeatures =
    isNotFound(accessibilityQuery) ||
    (accessibilityQuery.isSuccess && !features.length);

  return (
    <section
      className="hotel-details-section hotel-info-section"
      id="accessibility"
      aria-labelledby="hotel-accessibility-title"
    >
      <div className="hotel-info-section__heading">
        <p className="eyebrow">Accessibility</p>
        <h2 id="hotel-accessibility-title">Accessibility details</h2>
      </div>

      {accessibilityQuery.isLoading ? (
        <div className="hotel-info-section__state">
          Loading accessibility details from the backend.
        </div>
      ) : null}

      {accessibilityQuery.isError && !isNotFound(accessibilityQuery) ? (
        <div className="hotel-info-section__state">
          Accessibility details could not be loaded.
        </div>
      ) : null}

      {accessibilityQuery.isSuccess && features.length ? (
        <ul className="hotel-feature-grid">
          {features.map((feature) => (
            <li className="hotel-feature-item" key={feature.id}>
              <span aria-hidden="true" />
              <div>
                <strong>{feature.name}</strong>
                {feature.detail ? <small>{feature.detail}</small> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {hasNoFeatures ? (
        <div className="hotel-info-section__empty">
          No accessibility features are listed for this hotel yet.
        </div>
      ) : null}
    </section>
  );
}
