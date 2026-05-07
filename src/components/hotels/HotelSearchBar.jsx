import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getHotelCitySuggestions } from "../../features/search/search.api.js";

const initialSearch = {
  city: "",
  checkIn: "",
  checkOut: "",
  adults: "2",
  children: "0",
  childrenAges: "",
  rooms: "1",
  petsAllowed: false,
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function normalizeChildrenAges(value, childrenCount) {
  const count = Math.max(0, Number(childrenCount) || 0);
  const ages = String(value || "")
    .split(",")
    .map((age) => age.trim())
    .filter((age) => age !== "")
    .slice(0, count);

  return ages.join(",");
}

function getSearchFromParams(searchParams) {
  const children = searchParams.get("children") || initialSearch.children;

  return {
    ...initialSearch,
    city: searchParams.get("city") || initialSearch.city,
    checkIn: searchParams.get("checkIn") || initialSearch.checkIn,
    checkOut: searchParams.get("checkOut") || initialSearch.checkOut,
    adults: searchParams.get("adults") || initialSearch.adults,
    children,
    childrenAges: normalizeChildrenAges(
      searchParams.get("childrenAges") || initialSearch.childrenAges,
      Number(children),
    ),
    rooms: searchParams.get("rooms") || initialSearch.rooms,
    petsAllowed: searchParams.get("petsAllowed") === "true",
  };
}

function getAgeAtIndex(childrenAges, index) {
  return childrenAges.split(",")[index] ?? "";
}

function setAgeAtIndex(childrenAges, index, value, childrenCount) {
  const ages = Array.from({ length: childrenCount }, (_, ageIndex) =>
    getAgeAtIndex(childrenAges, ageIndex),
  );

  ages[index] = value;
  return ages.join(",").replace(/,+$/, "");
}

function getDateFromValue(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const date = getDateFromValue(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return date;
  });
}

function isSameDate(firstDate, secondDate) {
  return (
    firstDate &&
    secondDate &&
    formatDateValue(firstDate) === formatDateValue(secondDate)
  );
}

function isBetweenDates(date, startDate, endDate) {
  return startDate && endDate && date > startDate && date < endDate;
}

function getSuggestionSource(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.suggestions ?? response?.data ?? response?.content ?? [];
}

function getCitySuggestion(item) {
  // Backend may return plain strings (e.g. ["Cairo", "Casablanca"])
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed ? { city: trimmed, label: trimmed } : null;
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  const city = item.city ?? item.cityName ?? item.location?.city;

  if (!city) {
    return null;
  }

  const countryCode =
    item.countryCode ?? item.country ?? item.location?.countryCode ?? "";

  return {
    city: String(city).trim(),
    label: [city, countryCode].filter(Boolean).join(", "),
  };
}

function normalizeSuggestions(response) {
  const seenSuggestions = new Set();

  return getSuggestionSource(response)
    .map(getCitySuggestion)
    .filter(Boolean)
    .filter((suggestion) => {
      const key = `${suggestion.city}|${suggestion.label}`.toLowerCase();

      if (seenSuggestions.has(key)) {
        return false;
      }

      seenSuggestions.add(key);
      return true;
    })
    .slice(0, 6);
}

function getSuggestionErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "City suggestions are unavailable."
  );
}

function AgeDropdown({ label, onChange, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    return () => document.removeEventListener("mousedown", handleDocumentPointerDown);
  }, []);

  function handleSelect(age) {
    onChange(String(age));
    setIsOpen(false);
  }

  return (
    <div className="hotel-search__age-field" ref={dropdownRef}>
      <span>{label}</span>
      <button
        aria-expanded={isOpen}
        className={
          value === ""
            ? "hotel-search__age-toggle hotel-search__age-toggle--empty"
            : "hotel-search__age-toggle"
        }
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        {value === "" ? "Age" : value}
      </button>

      {isOpen ? (
        <div className="hotel-search__age-menu">
          {Array.from({ length: 18 }, (_, age) => (
            <button
              className={
                String(age) === value ? "hotel-search__age-option--selected" : ""
              }
              key={age}
              onClick={() => handleSelect(age)}
              type="button"
            >
              {age}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DateRangeField({ checkIn = "", checkOut = "", onChange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const calendarBoxRef = useRef(null);

  useEffect(() => {
    const selectedDate = getDateFromValue(checkIn);
    if (selectedDate) {
      setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [checkIn]);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!calendarBoxRef.current?.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    return () => document.removeEventListener("mousedown", handleDocumentPointerDown);
  }, []);

  const dateSummary =
    checkIn && checkOut
      ? `${formatDisplayDate(checkIn)} - ${formatDisplayDate(checkOut)}`
      : checkIn
        ? `${formatDisplayDate(checkIn)} - Check-out`
        : "Select dates";

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const checkInDate = getDateFromValue(checkIn);
  const checkOutDate = getDateFromValue(checkOut);

  function handleDateSelect(date) {
    const selectedDate = formatDateValue(date);

    if (!checkIn || checkOut || selectedDate <= checkIn) {
      onChange({
        checkIn: selectedDate,
        checkOut: "",
      });
      return;
    }

    onChange({ checkOut: selectedDate });
  }

  function handleClearDates() {
    onChange({
      checkIn: "",
      checkOut: "",
    });
  }

  function handleMonthStep(step) {
    setCalendarMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + step, 1),
    );
  }

  return (
    <div
      className="hotel-search__box hotel-search__box--dates"
      ref={calendarBoxRef}
    >
      <button
        aria-expanded={isCalendarOpen}
        className={`hotel-search__field-button${
          checkIn ? "" : " hotel-search__field-button--placeholder"
        }`}
        onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
        type="button"
      >
        {dateSummary}
      </button>

      {isCalendarOpen ? (
        <div className="hotel-search__calendar-panel">
          <div className="hotel-search__calendar-header">
            <button
              aria-label="Previous month"
              onClick={() => handleMonthStep(-1)}
              type="button"
            >
              -
            </button>
            <strong>
              {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
            </strong>
            <button
              aria-label="Next month"
              onClick={() => handleMonthStep(1)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="hotel-search__weekdays">
            {weekdayLabels.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="hotel-search__calendar-grid">
            {calendarDays.map((date) => {
              const isMuted = date.getMonth() !== calendarMonth.getMonth();
              const isStart = isSameDate(date, checkInDate);
              const isEnd = isSameDate(date, checkOutDate);
              const isRange = isBetweenDates(date, checkInDate, checkOutDate);

              return (
                <button
                  className={[
                    isMuted ? "hotel-search__calendar-day--muted" : "",
                    isStart || isEnd ? "hotel-search__calendar-day--selected" : "",
                    isRange ? "hotel-search__calendar-day--range" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={formatDateValue(date)}
                  onClick={() => handleDateSelect(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="hotel-search__calendar-actions">
            <span>{dateSummary}</span>
            <button onClick={handleClearDates} type="button">
              Clear
            </button>
            <button onClick={() => setIsCalendarOpen(false)} type="button">
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GuestSelector({
  adults = "2",
  children = "0",
  childrenAges = "",
  includePets = true,
  onChange,
  petsAllowed = false,
  rooms = "1",
}) {
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const guestsBoxRef = useRef(null);
  const childrenCount = Math.max(0, Number(children) || 0);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!guestsBoxRef.current?.contains(event.target)) {
        setIsGuestsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    return () => document.removeEventListener("mousedown", handleDocumentPointerDown);
  }, []);

  const guestSummary = useMemo(() => {
    const adultLabel = Number(adults) === 1 ? "adult" : "adults";
    const childLabel = Number(children) === 1 ? "child" : "children";
    const roomLabel = Number(rooms) === 1 ? "room" : "rooms";
    const separator = " \u00b7 ";
    const petLabel = includePets && petsAllowed ? `${separator}pets` : "";

    return `${adults} ${adultLabel}${separator}${children} ${childLabel}${separator}${rooms} ${roomLabel}${petLabel}`;
  }, [adults, children, includePets, petsAllowed, rooms]);

  function handleGuestStep(name, step) {
    const currentValues = { adults, children, rooms };
    const minimumValue = name === "children" ? 0 : 1;
    const currentValue = Number(currentValues[name]);
    const nextValue = Math.max(minimumValue, currentValue + step);
    const nextValues = {
      [name]: String(nextValue),
    };

    if (name === "children") {
      // Backend parsing for comma-separated childrenAges may need verification.
      nextValues.childrenAges = normalizeChildrenAges(childrenAges, nextValue);
    }

    onChange(nextValues);
  }

  function handleChildAgeChange(index, value) {
    onChange({
      childrenAges: setAgeAtIndex(
        childrenAges,
        index,
        value,
        childrenCount,
      ),
    });
  }

  function handlePetsChange(event) {
    onChange({
      petsAllowed: event.target.checked,
    });
  }

  return (
    <div
      className="hotel-search__box hotel-search__box--guests"
      ref={guestsBoxRef}
    >
      <button
        aria-expanded={isGuestsOpen}
        className="hotel-search__field-button hotel-search__field-button--placeholder"
        onClick={() => setIsGuestsOpen((isOpen) => !isOpen)}
        type="button"
      >
        {guestSummary}
      </button>

      {isGuestsOpen ? (
        <div className="hotel-search__guest-panel">
          {[
            ["adults", "Adults", adults],
            ["children", "Children", children],
            ["rooms", "Rooms", rooms],
          ].map(([name, label, value]) => (
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
                <strong>{value}</strong>
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

          {childrenCount > 0 ? (
            <div className="hotel-search__children-ages">
              {Array.from({ length: childrenCount }, (_, index) => (
                <AgeDropdown
                  key={index}
                  label={`Child ${index + 1} age`}
                  onChange={(value) => handleChildAgeChange(index, value)}
                  value={getAgeAtIndex(childrenAges, index)}
                />
              ))}
            </div>
          ) : null}

          {includePets ? (
            <label className="hotel-search__pets">
              <input
                checked={petsAllowed}
                name="petsAllowed"
                onChange={handlePetsChange}
                type="checkbox"
              />
              <span>Pet-friendly stays</span>
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function validateSearch(search) {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (search.checkIn) {
    const checkInDate = new Date(search.checkIn);
    if (checkInDate < today) {
      errors.push("Check-in date cannot be in the past.");
    }
  }

  if (search.checkIn && search.checkOut) {
    if (search.checkOut <= search.checkIn) {
      errors.push("Check-out date must be after check-in.");
    }
  }

  if (search.checkOut && !search.checkIn) {
    errors.push("Please also select a check-in date.");
  }

  const childrenCount = Math.max(0, Number(search.children) || 0);
  if (childrenCount > 0) {
    const providedAges = (search.childrenAges || "")
      .split(",")
      .filter((a) => a.trim() !== "");
    if (providedAges.length < childrenCount) {
      errors.push(
        `Please provide an age for all ${childrenCount} child${childrenCount !== 1 ? "ren" : ""} using the guest selector.`,
      );
    }
  }

  return errors;
}

export default function HotelSearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [suggestions, setSuggestions] = useState([]);
  const [areSuggestionsOpen, setAreSuggestionsOpen] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState("idle");
  const [suggestionError, setSuggestionError] = useState("");
  const [search, setSearch] = useState(() => getSearchFromParams(searchParams));
  const [formErrors, setFormErrors] = useState([]);

  const cityBoxRef = useRef(null);
  const shouldSkipSuggestionsRef = useRef(false);

  useEffect(() => {
    setSearch(getSearchFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!cityBoxRef.current?.contains(event.target)) {
        setAreSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    return () => document.removeEventListener("mousedown", handleDocumentPointerDown);
  }, []);

  useEffect(() => {
    if (search.city.trim().length < 1) {
      setSuggestions([]);
      setSuggestionStatus("idle");
      setSuggestionError("");
      return;
    }

    if (shouldSkipSuggestionsRef.current) {
      shouldSkipSuggestionsRef.current = false;
      return;
    }

    const controller = new AbortController();

    setSuggestionStatus("loading");
    setSuggestionError("");

    getHotelCitySuggestions(search.city.trim(), { signal: controller.signal })
      .then((response) => {
        setSuggestions(normalizeSuggestions(response));
        setSuggestionStatus("success");
        setAreSuggestionsOpen(true);
      })
      .catch((error) => {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return;
        }

        setSuggestions([]);
        setSuggestionStatus("error");
        setSuggestionError(getSuggestionErrorMessage(error));
        setAreSuggestionsOpen(true);
      });

    return () => controller.abort();
  }, [search.city]);

  function handleSearchChange(updates) {
    setSearch((currentSearch) => ({
      ...currentSearch,
      ...updates,
    }));
    setFormErrors([]);
  }

  function handleCityChange(event) {
    shouldSkipSuggestionsRef.current = false;
    handleSearchChange({ city: event.target.value });
    setAreSuggestionsOpen(true);
  }

  function handleSuggestionSelect(suggestion) {
    shouldSkipSuggestionsRef.current = true;
    handleSearchChange({ city: suggestion.city });
    setSuggestions([]);
    setSuggestionStatus("idle");
    setSuggestionError("");
    setAreSuggestionsOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const errors = validateSearch(search);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);

    const queryParams = new URLSearchParams();
    [
      "city",
      "checkIn",
      "checkOut",
      "adults",
      "children",
      "childrenAges",
      "rooms",
    ].forEach((key) => {
      const value = search[key];
      if (value !== "") {
        queryParams.set(key, value);
      }
    });

    if (search.petsAllowed) {
      queryParams.set("petsAllowed", "true");
    }

    queryParams.set("page", "0");
    navigate(`/search?${queryParams.toString()}`);
  }

  return (
    <form
      className={compact ? "hotel-search hotel-search--compact" : "hotel-search"}
      onSubmit={handleSubmit}
    >
      <div className="hotel-search__grid">
        <div className="hotel-search__box" ref={cityBoxRef}>
          <label className="sr-only" htmlFor="hotel-search-city">
            City
          </label>
          <input
            autoComplete="off"
            id="hotel-search-city"
            name="city"
            onChange={handleCityChange}
            onFocus={() => setAreSuggestionsOpen(true)}
            placeholder="Where are you going?"
            type="text"
            value={search.city}
          />

          {areSuggestionsOpen && suggestions.length > 0 ? (
            <div className="hotel-search__suggestions" role="listbox">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${index}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  role="option"
                  type="button"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}

          {areSuggestionsOpen &&
          search.city.trim().length > 0 &&
          suggestions.length === 0 ? (
            <div className="hotel-search__suggestions" role="status">
              {suggestionStatus === "loading" ? (
                <span className="hotel-search__suggestion-message">
                  Loading cities...
                </span>
              ) : null}

              {suggestionStatus === "error" ? (
                <span className="hotel-search__suggestion-message hotel-search__suggestion-message--error">
                  {suggestionError}
                </span>
              ) : null}

              {suggestionStatus === "success" ? (
                <span className="hotel-search__suggestion-message">
                  No cities with hotels found.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <DateRangeField
          checkIn={search.checkIn}
          checkOut={search.checkOut}
          onChange={handleSearchChange}
        />

        <GuestSelector
          adults={search.adults}
          children={search.children}
          childrenAges={search.childrenAges}
          onChange={handleSearchChange}
          petsAllowed={search.petsAllowed}
          rooms={search.rooms}
        />

        <button className="button button--primary hotel-search__submit" type="submit">
          Search
        </button>
      </div>

      {formErrors.length > 0 && (
        <ul className="hotel-search__errors" role="alert" aria-live="polite">
          {formErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
