import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const initialSearch = {
  city: "",
  checkIn: "",
  checkOut: "",
  adults: "2",
  children: "0",
  rooms: "1",
  petsAllowed: false,
};

function getSearchFromParams(searchParams) {
  return {
    ...initialSearch,
    city: searchParams.get("city") || initialSearch.city,
    checkIn: searchParams.get("checkIn") || initialSearch.checkIn,
    checkOut: searchParams.get("checkOut") || initialSearch.checkOut,
    adults: searchParams.get("adults") || initialSearch.adults,
    children: searchParams.get("children") || initialSearch.children,
    rooms: searchParams.get("rooms") || initialSearch.rooms,
    petsAllowed: searchParams.get("petsAllowed") === "true",
  };
}

export default function HotelSearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [search, setSearch] = useState(() => getSearchFromParams(searchParams));

  useEffect(() => {
    setSearch(getSearchFromParams(searchParams));
  }, [searchParams]);

  const guestSummary = useMemo(() => {
    const adultLabel = Number(search.adults) === 1 ? "adult" : "adults";
    const childLabel = Number(search.children) === 1 ? "child" : "children";
    const roomLabel = Number(search.rooms) === 1 ? "room" : "rooms";
    const separator = " \u00b7 ";
    const petLabel = search.petsAllowed ? `${separator}pets` : "";

    return `${search.adults} ${adultLabel}${separator}${search.children} ${childLabel}${separator}${search.rooms} ${roomLabel}${petLabel}`;
  }, [search.adults, search.children, search.petsAllowed, search.rooms]);

  function handleChange(event) {
    const { name, value } = event.target;
    setSearch((currentSearch) => ({
      ...currentSearch,
      [name]: value,
    }));
  }

  function handleGuestStep(name, step) {
    setSearch((currentSearch) => {
      const minimumValue = name === "children" ? 0 : 1;
      const currentValue = Number(currentSearch[name]);
      const nextValue = Math.max(minimumValue, currentValue + step);

      return {
        ...currentSearch,
        [name]: String(nextValue),
      };
    });
  }

  function handlePetsChange(event) {
    setSearch((currentSearch) => ({
      ...currentSearch,
      petsAllowed: event.target.checked,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const queryParams = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (key === "petsAllowed") {
        if (value) {
          queryParams.set("petsAllowed", "true");
        }
        return;
      }

      if (value !== "") {
        queryParams.set(key, value);
      }
    });

    queryParams.set("page", "0");
    navigate(`/search?${queryParams.toString()}`);
  }

  return (
    <form
      className={compact ? "hotel-search hotel-search--compact" : "hotel-search"}
      onSubmit={handleSubmit}
    >
      <div className="hotel-search__grid">
        <div className="hotel-search__box">
          <label htmlFor="hotel-search-city">City</label>
          <input
            id="hotel-search-city"
            name="city"
            onChange={handleChange}
            placeholder="Where are you going?"
            type="text"
            value={search.city}
          />
        </div>

        <div className="hotel-search__box hotel-search__box--dates">
          <span className="hotel-search__label">Duration / dates</span>
          <div className="hotel-search__dates">
            <label>
              <span>Check in</span>
              <input
                id="hotel-search-check-in"
                name="checkIn"
                onChange={handleChange}
                type="date"
                value={search.checkIn}
              />
            </label>
            <label>
              <span>Check out</span>
              <input
                id="hotel-search-check-out"
                name="checkOut"
                onChange={handleChange}
                type="date"
                value={search.checkOut}
              />
            </label>
          </div>
        </div>

        <div className="hotel-search__box hotel-search__box--guests">
          <span className="hotel-search__label">Guests + rooms + pets</span>
          <button
            aria-expanded={isGuestsOpen}
            className="hotel-search__guest-toggle"
            onClick={() => setIsGuestsOpen((isOpen) => !isOpen)}
            type="button"
          >
            {guestSummary}
          </button>

          {isGuestsOpen ? (
            <div className="hotel-search__guest-panel">
              {[
                ["adults", "Adults"],
                ["children", "Children"],
                ["rooms", "Rooms"],
              ].map(([name, label]) => (
                <div className="hotel-search__stepper" key={name}>
                  <span>{label}</span>
                  <div>
                    <button
                      aria-label={`Decrease ${label.toLowerCase()}`}
                      onClick={() => handleGuestStep(name, -1)}
                      type="button"
                    >
                      -
                    </button>
                    <strong>{search[name]}</strong>
                    <button
                      aria-label={`Increase ${label.toLowerCase()}`}
                      onClick={() => handleGuestStep(name, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <label className="hotel-search__pets">
                <input
                  checked={search.petsAllowed}
                  name="petsAllowed"
                  onChange={handlePetsChange}
                  type="checkbox"
                />
                <span>Pet-friendly stays</span>
              </label>
            </div>
          ) : null}
        </div>

        <button className="button button--primary hotel-search__submit" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
