export function phoneDisplay(shop) {
    if (shop.phoneDisplay)
        return shop.phoneDisplay;
    const digits = shop.phone.replace(/\D/g, "");
    const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    if (ten.length === 10) {
        return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
    }
    return shop.phone;
}
export function telHref(shop) {
    const digits = shop.phone.replace(/\D/g, "");
    if (digits.length === 10)
        return `tel:+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1"))
        return `tel:+${digits}`;
    return `tel:+${digits}`;
}
export function callLabel(shop) {
    return `Call ${phoneDisplay(shop)}`;
}
export function e164(shop) {
    const digits = shop.phone.replace(/\D/g, "");
    if (digits.length === 10)
        return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1"))
        return `+${digits}`;
    return `+${digits}`;
}
