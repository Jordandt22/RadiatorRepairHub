import {
  errorCodes,
  customErrorHandler,
  successHandler,
} from "../helpers/customErrorHandler.js";
import {
  getActiveAffiliateProducts,
  getActiveAffiliateProductsByIds,
} from "../supabase/supabase.functions.js";

const { SUPABASE_ERROR } = errorCodes;

export const getPublicAffiliateProducts = async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    const { data, error } = await getActiveAffiliateProducts();

    if (error) {
      return res
        .status(500)
        .json(
          customErrorHandler(
            SUPABASE_ERROR,
            "There was an error fetching affiliate products.",
            error
          )
        );
    }

    return res
      .status(200)
      .json(successHandler({ products: data ?? [] }));
  }

  const { data, error } = await getActiveAffiliateProductsByIds(ids);

  if (error) {
    return res
      .status(500)
      .json(
        customErrorHandler(
          SUPABASE_ERROR,
          "There was an error fetching affiliate products.",
          error
        )
      );
  }

  const byId = new Map((data ?? []).map((product) => [product.id, product]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean);

  return res.status(200).json(successHandler({ products }));
};
