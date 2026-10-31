import sharp from "sharp";

const LOGO_MAX_EDGE = 1024;
const GALLERY_MAX_EDGE = 2400;
const OUTPUT_QUALITY = 82;

/**
 * Re-encode partner intake uploads: auto-orient, strip metadata, resize, compress.
 * @param {Buffer} buffer
 * @param {{ kind?: "logo" | "gallery" }} [options]
 */
export async function processPartnerIntakeImage(buffer, { kind = "gallery" } = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Invalid image buffer.");
  }

  const maxEdge = kind === "logo" ? LOGO_MAX_EDGE : GALLERY_MAX_EDGE;
  const base = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await base.metadata();

  const pipeline = base.resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  });

  const encoded = await pipeline
    .webp({
      quality: OUTPUT_QUALITY,
      alphaQuality: meta.hasAlpha ? 100 : OUTPUT_QUALITY,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: encoded.data,
    contentType: "image/webp",
    width: encoded.info.width || null,
    height: encoded.info.height || null,
    byteSize: encoded.data.length,
  };
}

export const PARTNER_INTAKE_IMAGE_LIMITS = {
  logoMaxEdge: LOGO_MAX_EDGE,
  galleryMaxEdge: GALLERY_MAX_EDGE,
  outputQuality: OUTPUT_QUALITY,
};
