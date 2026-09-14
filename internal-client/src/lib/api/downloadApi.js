import { getActiveSite, getSiteApiUri } from "@/lib/sites";

/**
 * Download a binary/text response (e.g. CSV). Unlike fetchApi, does not parse JSON.
 */
export async function downloadApi(path, options = {}) {
  const site = getActiveSite();
  const apiUri = getSiteApiUri(site);
  if (!apiUri) {
    return {
      blob: null,
      filename: null,
      error: {
        message: `Missing API URL for ${site?.name || "the active site"}`,
      },
      status: 0,
    };
  }

  const { accessToken, headers, filename: preferredFilename, ...fetchOptions } =
    options;
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  const requestHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${apiUri}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      let message = "Download failed";
      if (contentType.includes("application/json")) {
        try {
          const json = await response.json();
          message = json?.error?.message || message;
        } catch {
          // keep default message
        }
      }
      return {
        blob: null,
        filename: null,
        error: { message },
        status: response.status,
      };
    }

    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(
      /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i,
    );
    const headerFilename = match?.[1]
      ? decodeURIComponent(match[1].replace(/"/g, "").trim())
      : null;

    const blob = await response.blob();
    return {
      blob,
      filename: headerFilename || preferredFilename || "download.csv",
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      blob: null,
      filename: null,
      error: { message: error.message || "Unable to reach the server" },
      status: 0,
    };
  }
}

export function triggerBlobDownload(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
