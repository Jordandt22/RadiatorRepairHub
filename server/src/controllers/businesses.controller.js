import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  cacheData,
  getFeaturedBusinessesKey,
  getCacheData,
  getBusinessByIdKey,
  // getBusinessesByStateKey,
  // getCountBusinessesByStateKey,
  // getCountBusinessesByCityKey,
  // getBusinessesByCityKey,
  // getCityBySlugKey,
  getSearchedBusinessesKey,
  getCountBusinessesBySearchKey,
} from "../redis/redis.js";
import {
  getTopRatedBusinesses,
  getBusinessById,
  // getBusinessesByState,
  // countBusinessesByState,
  // countBusinessesByCity,
  // getBusinessesByCity,
  // getCityBySlug,
  searchBusinesses,
} from "../supabase/supabase.functions.js";
import { getNestedValue } from "../lib/util.js";

const { SUPABASE_ERROR } = errorCodes;

export const getFeaturedBusinesses = async (req, res) => {
  // Get Data from Cache
  const { key, interval } = getFeaturedBusinessesKey();
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Top 10 Rated Businesses
  const { data, error } = await getTopRatedBusinesses();
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching featured businesses.",
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

export const getBusiness = async (req, res) => {
  const { business_id } = req.params;

  // Get Cache Data
  const { key, interval } = getBusinessByIdKey(business_id);
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Business by ID
  const { data, error } = await getBusinessById(business_id);
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          `There was an error fetching business by ID (${business_id}).`,
          error
        )
      );
  }

  // Cache Data
  await cacheData(key, interval, data);
  res.status(200).json(successHandler(data));
};

// ! DEPRECATED
// export const getStateBusinesses = async (req, res) => {
//   const { state_id } = req.params;
//   const { page, limit } = req.query;
//   let formattedPage = Number(page);
//   const formattedLimit = Number(limit);
//   let count = 0;

//   // Get Cached Count of Businesses by State Data
//   const { key: countKey, interval: countInterval } =
//     getCountBusinessesByStateKey(state_id);
//   const cachedCountData = await getCacheData(countKey);
//   if (cachedCountData) {
//     count = cachedCountData.data;
//   } else {
//     // Get Count of Businesses by State
//     const { count: countData, error: countError } =
//       await countBusinessesByState(state_id);
//     if (countError) {
//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching count of businesses by state (${state_id}).`,
//             countError
//           )
//         );
//     }

//     count = countData;
//     await cacheData(countKey, countInterval, count);
//   }

//   // Check Page
//   const totalPages = Math.ceil(count / formattedLimit);
//   if (formattedPage > totalPages) {
//     formattedPage = totalPages;
//   }

// };

// ! DEPRECATED
// export const getCityBusinesses = async (req, res) => {
//   const { city_slug, state_id } = req.params;
//   const { page, limit } = req.query;
//   let formattedPage = Number(page);
//   const formattedLimit = Number(limit);
//   let count = 0;
//   let city_id = null;
//   let cityData = null;

//   // Get Cached City Data
//   const { key: cityKey, interval: cityInterval } = getCityBySlugKey(
//     city_slug,
//     state_id
//   );
//   const cachedCityData = await getCacheData(cityKey);
//   if (cachedCityData) {
//     city_id = cachedCityData.data.id;
//     cityData = cachedCityData.data;
//   } else {
//     // Get City ID
//     const { data: cityDBData, error: cityError } = await getCityBySlug(
//       city_slug,
//       state_id
//     );
//     if (cityError) {
//       if (cityError.code === "PGRST116") {
//         return res
//           .status(404)
//           .json(
//             customErrorHandler(
//               SUPABASE_ERROR,
//               `City by slug (${city_slug}) in state (${state_id}) not found.`,
//               cityError
//             )
//           );
//       }

//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching city by slug (${city_slug}) in state (${state_id}).`,
//             cityError
//           )
//         );
//     }

//     city_id = cityDBData.id;
//     cityData = cityDBData;
//     await cacheData(cityKey, cityInterval, cityDBData);
//   }

//   // Get Cached Count of Businesses by City Data
//   const { key: countKey, interval: countInterval } =
//     getCountBusinessesByCityKey(city_id, state_id);
//   const cachedCountData = await getCacheData(countKey);
//   if (cachedCountData) {
//     count = cachedCountData.data;
//   } else {
//     // Get Count of Businesses by City
//     const { count: countData, error: countError } = await countBusinessesByCity(
//       city_id,
//       state_id
//     );
//     if (countError) {
//       return res
//         .status(500)
//         .json(
//           customErrorHandler(
//             SUPABASE_ERROR,
//             `There was an error fetching count of businesses by city (${city_id}).`,
//             countError
//           )
//         );
//     }

//     count = countData;
//     await cacheData(countKey, countInterval, count);
//   }

//   // Check Page
//   const totalPages = Math.ceil(count / formattedLimit);
//   if (formattedPage > totalPages) {
//     formattedPage = totalPages;
//   }

//   // Get Cached Businesses by City Data
//   const { key, interval } = getBusinessesByCityKey(
//     city_id,
//     state_id,
//     formattedPage,
//     formattedLimit
//   );
//   const cachedData = await getCacheData(key);
//   if (cachedData) {
//     return res.status(200).json(successHandler(cachedData.data));
//   }

//   // Get Businesses by City
//   const { data, error } = await getBusinessesByCity(
//     city_id,
//     state_id,
//     formattedPage,
//     formattedLimit
//   );
//   if (error) {
//     return res
//       .status(500)
//       .json(
//         customErrorHandler(
//           SUPABASE_ERROR,
//           `There was an error fetching businesses by city (${city_id}).`,
//           error
//         )
//       );
//   }

//   if (data.length === 0) {
//     return res.status(200).json(
//       successHandler({
//         businesses: [],
//         requestTotal: 0,
//         totalBusinesses: 0,
//         totalPages: 0,
//         page: formattedPage,
//         limit: formattedLimit,
//       })
//     );
//   }

//   // Cache Data
//   const compiledData = {
//     businesses: data,
//     requestTotal: data.length,
//     totalBusinesses: count,
//     totalPages,
//     page: formattedPage,
//     limit: formattedLimit,
//     city: {
//       id: city_id,
//       name: cityData.name,
//       slug: cityData.slug,
//       state_id: cityData.state_id,
//     },
//     state: cityData.state,
//   };

//   // Cache Data
//   await cacheData(key, interval, compiledData);
//   res.status(200).json(successHandler(compiledData));
// };

export const getSearchedBusinesses = async (req, res) => {
  const { page, limit } = req.query;
  const { sort_ascending } = req.body;
  let formattedPage = Number(page);
  const formattedLimit = Number(limit);
  let count = 0;
  let totalPages = 0;

  // All Possible Search Parameters
  const searchParamKeys = [
    { key: "title", filter: "ilike" },
    { key: "state_id", filter: "eq" },
    { key: "city_id", filter: "eq" },
    { key: "total_score", filter: "gte" },
    { key: "reviews_count", filter: "gte" },
    { key: "primary_category_id", filter: "eq" },
  ];

  // Adding features
  if (req.body.features) {
    Object.keys(req.body.features).forEach((featureKey) => {
      searchParamKeys.push({ key: `features.${featureKey}`, filter: "eq" });
    });
  }

  // Get Search Parameters that were sent
  const searchParamValues = [];
  searchParamKeys.forEach((param) => {
    const key = param.key;
    const value = param.value ? param.value : getNestedValue(req.body, key);
    if (value) {
      searchParamValues.push({
        key,
        value,
        filter: param.filter,
      });
    }
  });

  // Adding Secondary Categories
  if (req.body.secondary_categories) {
    searchParamValues.push({
      key: `secondary_categories.secondary_category_id`,
      value: req.body.secondary_categories,
      filter: "in",
    });
  }

  // Adding Open Filter
  if (req.body.open) {
    const openFilter = req.body.open;

    // Filter Weekdays and Weekends
    const openDays = [];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekends = ["Saturday", "Sunday"];
    if (openFilter.weekdays) {
      openDays.push(...weekdays);
    }
    if (openFilter.weekends) {
      openDays.push(...weekends);
    }

    if (openDays.length > 0) {
      searchParamValues.push({
        key: "hours.day_of_week",
        filter: "in",
        value: openDays,
      });
      searchParamValues.push({
        key: "hours.is_closed",
        filter: "eq",
        value: false,
      });
    }
  }

  // Get Cached Count of Searched Businesses
  const { key: countKey, interval: countInterval } =
    getCountBusinessesBySearchKey(searchParamValues, sort_ascending);
  const cachedCountData = await getCacheData(countKey);
  if (cachedCountData) {
    count = cachedCountData.data;

    // Check Page
    totalPages = Math.ceil(count / formattedLimit);
    if (formattedPage > totalPages) {
      formattedPage = totalPages;
    }
  } else {
    // Prevent going over total pages
    formattedPage = 1;
  }

  // Get Cached Data
  const { key, interval } = getSearchedBusinessesKey(
    searchParamValues,
    formattedPage,
    formattedLimit,
    sort_ascending
  );
  const cachedData = await getCacheData(key);
  if (cachedData) {
    return res.status(200).json(successHandler(cachedData.data));
  }

  // Get Searched Businesses
  const {
    data,
    count: countData,
    error,
  } = await searchBusinesses(
    searchParamValues,
    formattedPage,
    formattedLimit,
    sort_ascending
  );
  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error searching businesses.",
          error
        )
      );
  }

  if (data.length === 0) {
    return res.status(200).json(
      successHandler({
        businesses: [],
        requestTotal: 0,
        totalBusinesses: 0,
        totalPages: 0,
        page: formattedPage,
        limit: formattedLimit,
        sort_ascending,
      })
    );
  }

  // Set Total Pages
  totalPages = Math.ceil(countData / formattedLimit);

  // Compile Data
  const compiledData = {
    businesses: data,
    requestTotal: data.length,
    totalBusinesses: countData,
    totalPages,
    page: formattedPage,
    limit: formattedLimit,
    sort_ascending,
  };

  // Cache Count
  await cacheData(countKey, countInterval, countData);

  // Cache Data
  await cacheData(key, interval, compiledData);
  res.status(200).json(successHandler(compiledData));
};
