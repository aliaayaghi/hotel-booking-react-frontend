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

function getInitialFilters(searchParams) {
  return filterFields.reduce((values, field) => {
    values[field] = searchParams.get(field) ?? "";
    return values;
  }, {});
}

export default function FilterSidebar({ searchParams }) {
  const navigate = useNavigate();
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
      [name]: type === "checkbox" ? String(checked) : value,
    }));
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
      if (value) {
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
        <label className="filter-field">
          <span>Stars</span>
          <select name="stars" value={filters.stars} onChange={handleChange}>
            <option value="">Any</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>

        <div className="filter-sidebar__split">
          <label className="filter-field">
            <span>Min price</span>
            <input
              min="0"
              name="priceMin"
              type="number"
              value={filters.priceMin}
              onChange={handleChange}
            />
          </label>
          <label className="filter-field">
            <span>Max price</span>
            <input
              min="0"
              name="priceMax"
              type="number"
              value={filters.priceMax}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="filter-field">
          <span>Hotel type</span>
          <input
            name="hotelType"
            placeholder="Resort, hotel, villa"
            type="text"
            value={filters.hotelType}
            onChange={handleChange}
          />
        </label>

        <label className="filter-field">
          <span>Room type</span>
          <input
            name="roomType"
            placeholder="Suite, deluxe"
            type="text"
            value={filters.roomType}
            onChange={handleChange}
          />
        </label>

        <label className="filter-field">
          <span>Bed type</span>
          <input
            name="bedType"
            placeholder="King, queen"
            type="text"
            value={filters.bedType}
            onChange={handleChange}
          />
        </label>

        <label className="filter-field">
          <span>View</span>
          <input
            name="view"
            placeholder="Sea, city, garden"
            type="text"
            value={filters.view}
            onChange={handleChange}
          />
        </label>

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
            <input
              name="sortBy"
              placeholder="Backend sort field"
              type="text"
              value={filters.sortBy}
              onChange={handleChange}
            />
          </label>
          <label className="filter-field">
            <span>Order</span>
            <input
              name="sortOrder"
              placeholder="asc or desc"
              type="text"
              value={filters.sortOrder}
              onChange={handleChange}
            />
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
