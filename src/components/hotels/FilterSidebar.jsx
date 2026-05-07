import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const filterFields = [
  "stars",
  "priceMin",
  "priceMax",
  "hotelType",
  "roomType",
  "bedType",
  "view",
  "freeCancellation",
  "breakfastIncluded",
  "petsAllowed",
  "wheelchairAccessible",
  "sortBy",
  "sortOrder",
];

const preservedSearchFields = [
  "city",
  "checkIn",
  "checkOut",
  "adults",
  "children",
  "childrenAges",
  "rooms",
  "size",
];

const multiSelectFields = new Set(["stars", "hotelType", "roomType", "bedType", "view"]);

const filterOptions = {
  stars: [
    { value: "5", label: "5 stars" },
    { value: "4", label: "4 stars" },
    { value: "3", label: "3 stars" },
    { value: "2", label: "2 stars" },
    { value: "1", label: "1 star" },
  ],
  hotelType: [
    { value: "HOTEL", label: "Hotel" },
    { value: "RESORT", label: "Resort" },
    { value: "BOUTIQUE", label: "Boutique" },
    { value: "HOSTEL", label: "Hostel" },
    { value: "APARTMENT", label: "Apartment" },
    { value: "VILLA", label: "Villa" },
    { value: "GUESTHOUSE", label: "Guesthouse" },
    { value: "MOTEL", label: "Motel" },
    { value: "INN", label: "Inn" },
    { value: "LODGE", label: "Lodge" },
  ],
  roomType: [
    { value: "STANDARD", label: "Standard" },
    { value: "DELUXE", label: "Deluxe" },
    { value: "SUITE", label: "Suite" },
    { value: "STUDIO", label: "Studio" },
    { value: "FAMILY", label: "Family" },
    { value: "VILLA", label: "Villa" },
  ],
  bedType: [
    { value: "KING", label: "King" },
    { value: "QUEEN", label: "Queen" },
    { value: "TWIN", label: "Twin" },
    { value: "DOUBLE", label: "Double" },
    { value: "SINGLE", label: "Single" },
    { value: "BUNK", label: "Bunk" },
  ],
  view: [
    { value: "NONE", label: "None" },
    { value: "SEA", label: "Sea" },
    { value: "CITY", label: "City" },
    { value: "GARDEN", label: "Garden" },
    { value: "POOL", label: "Pool" },
  ],
};

const sortOptions = [
  { value: "", label: "Backend default" },
  { value: "name", label: "Name" },
  { value: "starRating", label: "Stars" },
  { value: "lowestPrice", label: "Price" },
  { value: "availableRooms", label: "Available rooms" },
];

function getValues(searchParams, field) {
  const values = searchParams.getAll(field);
  const fallbackValue = searchParams.get(field);

  if (values.length > 1 || !fallbackValue?.includes(",")) {
    return values;
  }

  return fallbackValue.split(",").filter(Boolean);
}

function getInitialFilters(searchParams) {
  return filterFields.reduce((values, field) => {
    if (field === "sortOrder") {
      values[field] = searchParams.get(field) ?? "asc";
      return values;
    }

    values[field] = multiSelectFields.has(field)
      ? getValues(searchParams, field)
      : searchParams.get(field) ?? "";
    return values;
  }, {});
}

function getPriceValue(value, fallback) {
  const price = Number(value);

  return Number.isFinite(price) ? String(price) : String(fallback);
}

function ToggleGroup({ name, options, title, values, onChange }) {
  return (
    <fieldset className="filter-toggle-group">
      <legend>{title}</legend>
      <div className="filter-toggle-group__options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              checked={values.includes(option.value)}
              name={name}
              type="checkbox"
              value={option.value}
              onChange={onChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function FilterSidebar({ priceBounds = { min: 0, max: 1000 }, searchParams }) {
  const navigate = useNavigate();
  const minPrice = priceBounds.min;
  const maxPrice = Math.max(priceBounds.max, minPrice);
  const initialFilters = useMemo(
    () => getInitialFilters(searchParams),
    [searchParams],
  );
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: type === "checkbox" && multiSelectFields.has(name)
        ? checked
          ? [...currentFilters[name], value]
          : currentFilters[name].filter((item) => item !== value)
        : type === "checkbox"
          ? String(checked)
          : value,
    }));
  }

  function handlePriceChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => {
      const nextFilters = { ...currentFilters, [name]: value };
      const nextMin = Number(nextFilters.priceMin || minPrice);
      const nextMax = Number(nextFilters.priceMax || maxPrice);

      if (name === "priceMin" && nextMin > nextMax) {
        nextFilters.priceMax = value;
      }

      if (name === "priceMax" && nextMax < nextMin) {
        nextFilters.priceMin = value;
      }

      return nextFilters;
    });
  }

  function buildParams(nextFilters) {
    const params = new URLSearchParams();

    preservedSearchFields.forEach((field) => {
      const value = searchParams.get(field);
      if (value) {
        params.set(field, value);
      }
    });

    Object.entries(nextFilters).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(field, item));
      } else if (value) {
        params.set(field, value);
      }
    });

    params.set("page", "0");
    return params;
  }

  function handleSubmit(event) {
    event.preventDefault();
    navigate(`/search?${buildParams(filters).toString()}`);
  }

  function handleReset() {
    const resetFilters = getInitialFilters(new URLSearchParams());
    setFilters(resetFilters);
    navigate(`/search?${buildParams(resetFilters).toString()}`);
  }

  return (
    <aside className="filter-sidebar" aria-label="Hotel search filters">
      <div className="filter-sidebar__header">
        <p className="eyebrow">Filters</p>
        <h2>Refine results</h2>
      </div>

      <form className="filter-sidebar__form" onSubmit={handleSubmit}>
        <ToggleGroup
          name="stars"
          options={filterOptions.stars}
          title="Stars"
          values={filters.stars}
          onChange={handleChange}
        />

        <div className="filter-price-range">
          <div className="filter-price-range__labels">
            <span>Price range</span>
            <strong>
              ${getPriceValue(filters.priceMin, minPrice)} - ${getPriceValue(filters.priceMax, maxPrice)}
            </strong>
          </div>
          <label>
            Min
            <input
              max={maxPrice}
              min={minPrice}
              name="priceMin"
              type="range"
              value={getPriceValue(filters.priceMin, minPrice)}
              onChange={handlePriceChange}
            />
          </label>
          <label>
            Max
            <input
              max={maxPrice}
              min={minPrice}
              name="priceMax"
              type="range"
              value={getPriceValue(filters.priceMax, maxPrice)}
              onChange={handlePriceChange}
            />
          </label>
        </div>

        <ToggleGroup
          name="hotelType"
          options={filterOptions.hotelType}
          title="Hotel type"
          values={filters.hotelType}
          onChange={handleChange}
        />

        <ToggleGroup
          name="roomType"
          options={filterOptions.roomType}
          title="Room type"
          values={filters.roomType}
          onChange={handleChange}
        />

        <ToggleGroup
          name="bedType"
          options={filterOptions.bedType}
          title="Bed type"
          values={filters.bedType}
          onChange={handleChange}
        />

        <ToggleGroup
          name="view"
          options={filterOptions.view}
          title="View"
          values={filters.view}
          onChange={handleChange}
        />

        <div className="filter-sidebar__checks">
          <label>
            <input
              checked={filters.freeCancellation === "true"}
              name="freeCancellation"
              type="checkbox"
              onChange={handleChange}
            />
            Free cancellation
          </label>
          <label>
            <input
              checked={filters.breakfastIncluded === "true"}
              name="breakfastIncluded"
              type="checkbox"
              onChange={handleChange}
            />
            Breakfast included
          </label>
          <label>
            <input
              checked={filters.petsAllowed === "true"}
              name="petsAllowed"
              type="checkbox"
              onChange={handleChange}
            />
            Pets allowed
          </label>
          <label>
            <input
              checked={filters.wheelchairAccessible === "true"}
              name="wheelchairAccessible"
              type="checkbox"
              onChange={handleChange}
            />
            Wheelchair accessible
          </label>
        </div>

        <div className="filter-sidebar__split">
          <label className="filter-field">
            <span>Sort by</span>
            <select name="sortBy" value={filters.sortBy} onChange={handleChange}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Order</span>
            <select name="sortOrder" value={filters.sortOrder} onChange={handleChange}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>

        <div className="filter-sidebar__actions">
          <button className="button button--primary" type="submit">
            Apply filters
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
