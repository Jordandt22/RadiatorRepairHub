import demo from "../../content/demo.json";
const config = demo;
export function getConfig() {
    return config;
}
export function homeTrust(c = config) {
    return c.trust.slice(0, 4);
}
export function homeServices(c = config) {
    return c.services.slice(0, 8);
}
/** Heavy shows every review; ReviewsSection paginates past the first three. */
export function homeReviews(c = config) {
    return c.reviews.items;
}
export function showGallery(c = config) {
    return Boolean(c.gallery.enabled && c.gallery.images.length);
}
export function homeGallery(c = config) {
    return c.gallery.images.slice(0, 6);
}
export function serviceAreas(c = config) {
    if (!c.features?.showServiceAreas)
        return [];
    return c.location?.serviceAreas ?? [];
}
