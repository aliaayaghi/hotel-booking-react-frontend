import React from "react";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import FilterSidebar from "../../components/hotels/FilterSidebar.jsx";
import HotelCard from "../../components/hotels/HotelCard.jsx";
import HotelSearchBar from "../../components/hotels/HotelSearchBar.jsx";
import { useHotelSearch } from "../../features/search/searchHooks.js";

function getHotelsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.hotels)) {
    return data.hotels;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  return [];
}

function getTotalResults(data, hotels) {
  return data?.totalElements ?? data?.totalItems ?? data?.data?.totalElements ?? hotels.length;
}

function getTotalPages(data) {
  return data?.totalPages ?? data?.data?.totalPages ?? 1;
}

function getCurrentPage(searchParams, data) {
  const urlPage = Number(searchParams.get("page") ?? "0");
  return data?.number ?? data?.page ?? data?.data?.number ?? urlPage;
}

function ResultCount({ searchParams, totalResults }) {
  const city = searchParams.get("city");
  const placeLabel = city ? city : "Search results";
  const propertyLabel = Number(totalResults) === 1 ? "property" : "properties";

  return (
    <p className="search-result-count">
      {placeLabel}: {totalResults} {propertyLabel} found
    </p>
  );
}

function Pagination({ currentPage, totalPages, searchParams, setSearchParams }) {
  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(page));
    setSearchParams(nextParams);
  }

  return (
    <nav className="search-pagination" aria-label="Search results pagination">
      <button
        className="button button--secondary"
        disabled={currentPage <= 0}
        type="button"
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </button>
      <span>
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        className="button button--secondary"
        disabled={currentPage + 1 >= totalPages}
        type="button"
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hotelSearch = useHotelSearch(searchParams);
  const hotels = getHotelsFromResponse(hotelSearch.data);
  const totalResults = getTotalResults(hotelSearch.data, hotels);
  const totalPages = getTotalPages(hotelSearch.data);
  const currentPage = getCurrentPage(searchParams, hotelSearch.data);

  const backendError = hotelSearch.isError
    ? (hotelSearch.error?.response?.data?.message ??
       hotelSearch.error?.response?.data?.error ??
       hotelSearch.error?.message ??
       "Search request failed.")
    : null;

  return (
    <main className="public-page search-page">
      <HotelSearchBar compact />

      {backendError && (
        <div className="search-backend-error" role="alert">
          <strong>Search error:</strong> {backendError}
        </div>
      )}

      <ResultCount searchParams={searchParams} totalResults={totalResults} />

      <div className="search-page__layout">
        <FilterSidebar searchParams={searchParams} />

        <section className="search-page__results" aria-label="Hotel search results">
          {hotelSearch.isLoading ? (
            <LoadingState message="Fetching hotels from the backend search endpoint." />
          ) : null}

          {hotelSearch.isError ? null : null}

          {hotelSearch.isSuccess && hotels.length === 0 ? <EmptyState /> : null}

          {hotelSearch.isSuccess && hotels.length > 0 ? (
            <>
              <div className="hotel-results-list">
                {hotels.map((hotel, index) => (
                  <HotelCard
                    hotel={hotel}
                    key={hotel.id ?? hotel.hotelId ?? `${hotel.name}-${index}`}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                totalPages={totalPages}
              />
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
