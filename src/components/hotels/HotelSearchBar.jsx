import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialSearch = {
  city: "",
  checkIn: "",
  checkOut: "",
  adults: "2",
  children: "0",
  rooms: "1",
};

export default function HotelSearchBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialSearch);

  function handleChange(event) {
    const { name, value } = event.target;
    setSearch((currentSearch) => ({
      ...currentSearch,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const queryParams = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value !== "") {
        queryParams.set(key, value);
      }
    });

    navigate(`/search?${queryParams.toString()}`);
  }

  return (
    <form className="hotel-search" onSubmit={handleSubmit}>
      <div className="hotel-search__grid">
        <div className="hotel-search__field">
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

        <div className="hotel-search__field">
          <label htmlFor="hotel-search-check-in">Check in</label>
          <input
            id="hotel-search-check-in"
            name="checkIn"
            onChange={handleChange}
            type="date"
            value={search.checkIn}
          />
        </div>

        <div className="hotel-search__field">
          <label htmlFor="hotel-search-check-out">Check out</label>
          <input
            id="hotel-search-check-out"
            name="checkOut"
            onChange={handleChange}
            type="date"
            value={search.checkOut}
          />
        </div>

        <div className="hotel-search__field">
          <label htmlFor="hotel-search-adults">Adults</label>
          <input
            id="hotel-search-adults"
            min="1"
            name="adults"
            onChange={handleChange}
            type="number"
            value={search.adults}
          />
        </div>

        <div className="hotel-search__field">
          <label htmlFor="hotel-search-children">Children</label>
          <input
            id="hotel-search-children"
            min="0"
            name="children"
            onChange={handleChange}
            type="number"
            value={search.children}
          />
        </div>

        <div className="hotel-search__field">
          <label htmlFor="hotel-search-rooms">Rooms</label>
          <input
            id="hotel-search-rooms"
            min="1"
            name="rooms"
            onChange={handleChange}
            type="number"
            value={search.rooms}
          />
        </div>
      </div>

      <button className="button button--primary hotel-search__submit" type="submit">
        Search stays
      </button>
    </form>
  );
}
