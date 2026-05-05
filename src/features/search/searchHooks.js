import { useQuery } from "@tanstack/react-query";

import { buildHotelSearchParams, searchHotels } from "./search.api.js";

export function useHotelSearch(searchParams) {
  const params = buildHotelSearchParams(searchParams);

  return useQuery({
    queryKey: ["hotels", "search", params],
    queryFn: () => searchHotels(params),
  });
}
