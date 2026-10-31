import { supabase } from "../supabase/supabase.js";
import { MAX_IMAGES } from "./partnerWebsiteIntake.js";

export const PARTNER_MEDIA_CONSENT_VERSION = "partner_media_v1";
export const MAX_MEDIA_CAPTION_LENGTH = 120;

export const PARTNER_MEDIA_SELECT_FIELDS =
  "id, business_id, kind, image_id, url, sort_order, original_filename, content_type, byte_size, width, height, caption, created_at";

function mapMediaRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    imageId: row.image_id,
    url: row.url,
    kind: row.kind,
    sortOrder: row.sort_order,
    originalFilename: row.original_filename ?? null,
    contentType: row.content_type,
    byteSize: row.byte_size,
    width: row.width ?? null,
    height: row.height ?? null,
    caption: row.caption ? String(row.caption) : "",
    createdAt: row.created_at ?? null,
  };
}

export function mediaPayloadFromRows(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  const logoRow = list.find((row) => row.kind === "logo");
  const gallery = list
    .filter((row) => row.kind === "gallery")
    .slice()
    .sort((a, b) => {
      const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (order !== 0) return order;
      return String(a.created_at || "").localeCompare(String(b.created_at || ""));
    })
    .map((row) => ({
      imageId: row.image_id,
      url: row.url,
      caption: row.caption ? String(row.caption) : "",
    }));

  return {
    logo: logoRow
      ? { imageId: logoRow.image_id, url: logoRow.url }
      : null,
    images: gallery,
  };
}

export async function listPartnerWebsiteMedia(businessId) {
  const { data, error } = await supabase
    .from("partner_website_media")
    .select(PARTNER_MEDIA_SELECT_FIELDS)
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return { rows: [], error };
  return { rows: data || [], error: null };
}

export async function insertPartnerWebsiteMedia({
  businessId,
  kind,
  imageId,
  url,
  sortOrder = 0,
  originalFilename = null,
  contentType,
  byteSize,
  width = null,
  height = null,
}) {
  const { data, error } = await supabase
    .from("partner_website_media")
    .insert({
      business_id: businessId,
      kind,
      image_id: imageId,
      url,
      sort_order: sortOrder,
      original_filename: originalFilename,
      content_type: contentType,
      byte_size: byteSize,
      width,
      height,
    })
    .select(PARTNER_MEDIA_SELECT_FIELDS)
    .single();

  return { row: data, error };
}

export async function deletePartnerWebsiteMediaByImageId(businessId, imageId) {
  const { data, error } = await supabase
    .from("partner_website_media")
    .delete()
    .eq("business_id", businessId)
    .eq("image_id", imageId)
    .select(PARTNER_MEDIA_SELECT_FIELDS);

  return { rows: data || [], error };
}

export async function updatePartnerWebsiteMediaCaption(
  businessId,
  imageId,
  caption
) {
  const nextCaption =
    typeof caption === "string" ? caption.trim().slice(0, MAX_MEDIA_CAPTION_LENGTH) : "";
  const { data, error } = await supabase
    .from("partner_website_media")
    .update({ caption: nextCaption || null })
    .eq("business_id", businessId)
    .eq("image_id", imageId)
    .eq("kind", "gallery")
    .select(PARTNER_MEDIA_SELECT_FIELDS)
    .maybeSingle();

  return { row: data, error };
}

export async function deletePartnerWebsiteLogo(businessId) {
  const { data, error } = await supabase
    .from("partner_website_media")
    .delete()
    .eq("business_id", businessId)
    .eq("kind", "logo")
    .select(PARTNER_MEDIA_SELECT_FIELDS);

  return { rows: data || [], error };
}

export async function nextGallerySortOrder(businessId) {
  const { data, error } = await supabase
    .from("partner_website_media")
    .select("sort_order")
    .eq("business_id", businessId)
    .eq("kind", "gallery")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { sortOrder: 0, error };
  const current = Number(data?.sort_order);
  return {
    sortOrder: Number.isFinite(current) ? current + 1 : 0,
    error: null,
  };
}

export async function countGalleryImages(businessId) {
  const { count, error } = await supabase
    .from("partner_website_media")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("kind", "gallery");

  return { count: count ?? 0, error };
}

export function assertGalleryCapacity(count) {
  if (count >= MAX_IMAGES) {
    return `You can upload up to ${MAX_IMAGES} images.`;
  }
  return null;
}

export { mapMediaRow };
