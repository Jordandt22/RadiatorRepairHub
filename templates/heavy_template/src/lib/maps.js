function placeQuery(config) {
    const { shop } = config;
    return `${shop.name}, ${shop.address}, ${shop.city}, ${shop.state} ${shop.zip}`;
}

/**
 * A `ChIJ` Place ID stores the Maps CID in its last 8 bytes.
 * `q=place_id:` embeds ignore that ID and render a world map.
 */
function cidFromPlaceId(placeId) {
    try {
        const padded = placeId.replace(/-/g, "+").replace(/_/g, "/");
        const binary = atob(padded);
        if (binary.length < 8) return null;
        let cid = 0n;
        for (let i = 0; i < 8; i += 1) {
            cid |= BigInt(binary.charCodeAt(binary.length - 8 + i)) << BigInt(8 * i);
        }
        return cid > 0n ? cid.toString() : null;
    } catch {
        return null;
    }
}
/** Google Maps URL. Prefers Place ID (`query_place_id`); falls back to `googleMapsUrl`. */
export function mapsHref(config) {
    const id = config.location.placeId?.trim();
    if (id) {
        const params = new URLSearchParams({
            api: "1",
            query: placeQuery(config),
            query_place_id: id,
        });
        return `https://www.google.com/maps/search/?${params.toString()}`;
    }
    return config.location.googleMapsUrl ?? "";
}

/**
 * iframe src for an embedded map.
 * Prefers `location.embedUrl`; otherwise builds from Place ID / address when `features.embedMap` is on.
 */
export function mapsEmbedSrc(config) {
    const explicit = config.location.embedUrl?.trim();
    if (explicit) return explicit;
    if (!config.features?.embedMap) return null;
    const id = config.location.placeId?.trim();
    const cid = id ? cidFromPlaceId(id) : null;
    if (cid) {
        return `https://maps.google.com/maps?cid=${cid}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery(config))}&z=15&output=embed`;
}

/** Google reviews / Business Profile. Prefers Place ID; falls back to `reviews.googleUrl`. */
export function googleReviewsHref(config) {
    const id = config.location.placeId?.trim();
    if (id) {
        return `https://search.google.com/local/reviews?placeid=${encodeURIComponent(id)}`;
    }
    return config.reviews.googleUrl || undefined;
}

/** Google "write a review" form. Needs a Place ID; otherwise the reviews list. */
export function googleWriteReviewHref(config) {
    const id = config.location.placeId?.trim();
    if (id) {
        return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
    }
    return config.reviews.googleUrl || undefined;
}
