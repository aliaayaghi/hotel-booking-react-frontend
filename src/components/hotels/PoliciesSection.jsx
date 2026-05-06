import React from "react";

function isMissingPolicy(query) {
  return query.isError && query.error?.response?.status === 404;
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

function formatBoolean(value, positive, negative) {
  if (value === true) {
    return positive;
  }

  if (value === false) {
    return negative;
  }

  return "";
}

function getCheckinItems(policy) {
  const checkIn = readValue(policy, [
    "checkInTime",
    "checkinTime",
    "checkInFrom",
    "checkinFrom",
    "fromTime",
  ]);
  const checkOut = readValue(policy, [
    "checkOutTime",
    "checkoutTime",
    "checkOutUntil",
    "checkoutUntil",
    "toTime",
  ]);
  const description = readValue(policy, [
    "description",
    "policyText",
    "notes",
    "specialInstructions",
  ]);

  return [
    checkIn ? { label: "Check-in", value: checkIn } : null,
    checkOut ? { label: "Check-out", value: checkOut } : null,
    description ? { label: "Details", value: description } : null,
  ].filter(Boolean);
}

function getPetsItems(policy) {
  const allowedText = formatBoolean(
    readValue(policy, ["allowed", "petsAllowed"]),
    "Pets allowed",
    "Pets not allowed",
  );
  const fee = readValue(policy, ["fee", "petFee", "price", "amount"]);
  const currency = readValue(policy, ["currency", "currencyCode"]);
  const description = readValue(policy, ["description", "policyText", "notes"]);

  return [
    allowedText ? { label: "Pet policy", value: allowedText } : null,
    fee ? { label: "Pet fee", value: `${fee}${currency ? ` ${currency}` : ""}` } : null,
    description ? { label: "Details", value: description } : null,
  ].filter(Boolean);
}

function getBreakfastItems(policy) {
  const includedText = formatBoolean(
    readValue(policy, ["included", "breakfastIncluded"]),
    "Breakfast included",
    "Breakfast not included",
  );
  const availableText = formatBoolean(
    readValue(policy, ["available", "breakfastAvailable"]),
    "Breakfast available",
    "Breakfast unavailable",
  );
  const type = readValue(policy, ["type", "breakfastType", "mealType"]);
  const price = readValue(policy, ["price", "fee", "amount"]);
  const currency = readValue(policy, ["currency", "currencyCode"]);
  const description = readValue(policy, ["description", "policyText", "notes"]);

  return [
    includedText ? { label: "Included", value: includedText } : null,
    !includedText && availableText
      ? { label: "Availability", value: availableText }
      : null,
    type ? { label: "Breakfast type", value: type } : null,
    price
      ? { label: "Breakfast price", value: `${price}${currency ? ` ${currency}` : ""}` }
      : null,
    description ? { label: "Details", value: description } : null,
  ].filter(Boolean);
}

function PolicyCard({ emptyMessage, items, query, title }) {
  const unavailable = isMissingPolicy(query);

  return (
    <article className="policy-card">
      <h3>{title}</h3>

      {query.isLoading ? <p>Loading policy from the backend.</p> : null}

      {query.isError && !unavailable ? <p>Policy could not be loaded.</p> : null}

      {unavailable ? <p>{emptyMessage}</p> : null}

      {query.isSuccess && items.length ? (
        <dl>
          {items.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <dt>{item.label}</dt>
              <dd>{String(item.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {query.isSuccess && !items.length ? <p>{emptyMessage}</p> : null}
    </article>
  );
}

export default function PoliciesSection({
  breakfastPolicyQuery,
  checkinPolicyQuery,
  petsPolicyQuery,
}) {
  const checkinItems = checkinPolicyQuery.isSuccess
    ? getCheckinItems(checkinPolicyQuery.data)
    : [];
  const petsItems = petsPolicyQuery.isSuccess
    ? getPetsItems(petsPolicyQuery.data)
    : [];
  const breakfastItems = breakfastPolicyQuery.isSuccess
    ? getBreakfastItems(breakfastPolicyQuery.data)
    : [];

  return (
    <section
      className="hotel-details-section hotel-info-section"
      id="policies"
      aria-labelledby="hotel-policies-title"
    >
      <div className="hotel-info-section__heading">
        <p className="eyebrow">Policies</p>
        <h2 id="hotel-policies-title">Stay policies</h2>
      </div>

      <div className="policy-grid">
        <PolicyCard
          emptyMessage="Check-in and check-out policy is not listed yet."
          items={checkinItems}
          query={checkinPolicyQuery}
          title="Check-in and check-out"
        />
        <PolicyCard
          emptyMessage="Pet policy is not listed yet."
          items={petsItems}
          query={petsPolicyQuery}
          title="Pets"
        />
        <PolicyCard
          emptyMessage="Breakfast policy is not listed yet."
          items={breakfastItems}
          query={breakfastPolicyQuery}
          title="Breakfast"
        />
      </div>
    </section>
  );
}
