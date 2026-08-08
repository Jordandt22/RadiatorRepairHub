import { v2 as cloudinary } from "cloudinary";

let configured = false;

/** Cap stored originals so storage/bandwidth stay bounded. */
export const BUSINESS_IMAGE_UPLOAD_TRANSFORMATION = [
  { width: 1200, crop: "limit", quality: "auto:good" },
];

export function getCloudinaryEnvFolder() {
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

/** Media Library folder: {env}/business/{businessId} */
export function buildBusinessImageAssetFolder(businessId) {
  return `${getCloudinaryEnvFolder()}/business/${businessId}`;
}

/** Delivery public_id: {env}/business/{businessId}/{imageId} */
export function buildBusinessImagePublicId(businessId, imageId) {
  return `${buildBusinessImageAssetFolder(businessId)}/${imageId}`;
}

export function configureCloudinary() {
  if (configured) return;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Missing Cloudinary credentials. Need CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

/**
 * Upload with both public_id (delivery path) and asset_folder (Media Library tree).
 * Dynamic-folder Cloudinary accounts need asset_folder to show env/business folders.
 * Incoming transform recompresses/resizes so the stored original stays small.
 */
export function uploadBufferToCloudinary(buffer, { publicId, assetFolder }) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        asset_folder: assetFolder,
        overwrite: true,
        resource_type: "image",
        transformation: BUSINESS_IMAGE_UPLOAD_TRANSFORMATION,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
