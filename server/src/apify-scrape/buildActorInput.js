import { DEFAULT_MAX_PLACES, DEFAULT_SEARCH_KEYWORD } from "./constants.js";

export function buildActorInput({
  locationQuery,
  searchKeyword = DEFAULT_SEARCH_KEYWORD,
  maxPlaces = DEFAULT_MAX_PLACES,
}) {
  return {
    enableCompetitorAnalysis: false,
    includeWebResults: false,
    language: "en",
    locationQuery,
    maxCrawledPlacesPerSearch: maxPlaces,
    maxImages: 0,
    maximumLeadsEnrichmentRecords: 0,
    scrapeContacts: false,
    scrapeDirectories: false,
    scrapeImageAuthors: false,
    scrapeOrderOnline: false,
    scrapePlaceDetailPage: false,
    scrapeReviewsPersonalData: true,
    scrapeTableReservationProvider: false,
    searchStringsArray: [searchKeyword],
    skipClosedPlaces: false,
    verifyLeadsEnrichmentEmails: false,
  };
}
