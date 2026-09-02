import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLAIMED_IMAGE_LIMIT,
  FEATURED_IMAGE_LIMIT,
  getBusinessImageLimit,
  selectPublicGalleryImages,
  applyPublicCoverImage,
  detectImageMime,
  withDefaultListingImage,
  formatAdminGalleryImages,
} from "./businessImages.js";

const rows = [
  { image_id: "older", is_primary: false, created_at: "2026-01-01T00:00:00Z" },
  { image_id: "primary", is_primary: true, created_at: "2026-01-02T00:00:00Z" },
  { image_id: "newer", is_primary: false, created_at: "2026-01-03T00:00:00Z" },
  { image_id: "extra-1", is_primary: false, created_at: "2026-01-04T00:00:00Z" },
  { image_id: "extra-2", is_primary: false, created_at: "2026-01-05T00:00:00Z" },
];

describe("getBusinessImageLimit", () => {
  it("returns claimed and featured caps", () => {
    assert.equal(getBusinessImageLimit({ isFeatured: false }), CLAIMED_IMAGE_LIMIT);
    assert.equal(getBusinessImageLimit({}), CLAIMED_IMAGE_LIMIT);
    assert.equal(getBusinessImageLimit({ isFeatured: true }), FEATURED_IMAGE_LIMIT);
  });
});

describe("selectPublicGalleryImages", () => {
  it("returns only the default primary for unclaimed listings", () => {
    assert.deepEqual(
      selectPublicGalleryImages(rows, { isClaimed: false, isFeatured: true }),
      [{ image_id: "primary", is_primary: true }]
    );
  });

  it("puts primary first and slices to the claimed limit", () => {
    assert.deepEqual(
      selectPublicGalleryImages(rows, { isClaimed: true, isFeatured: false }),
      [
        { image_id: "primary", is_primary: true, image_url: null, is_default: false },
        { image_id: "older", is_primary: false, image_url: null, is_default: false },
        { image_id: "newer", is_primary: false, image_url: null, is_default: false },
      ]
    );
  });

  it("keeps extras when Featured", () => {
    const images = selectPublicGalleryImages(rows, {
      isClaimed: true,
      isFeatured: true,
    });
    assert.equal(images.length, 5);
    assert.equal(images[0].image_id, "primary");
    assert.equal(images[4].image_id, "extra-2");
  });

  it("keeps extras when no stored primary exists", () => {
    const extras = rows.filter((row) => !row.is_primary);
    assert.deepEqual(
      selectPublicGalleryImages(extras, { isClaimed: true, isFeatured: false }),
      [
        { image_id: "older", is_primary: false, image_url: null, is_default: false },
        { image_id: "newer", is_primary: false, image_url: null, is_default: false },
        { image_id: "extra-1", is_primary: false, image_url: null, is_default: false },
      ]
    );
  });

  it("does not invent a primary for unclaimed extras", () => {
    const extras = rows.filter((row) => !row.is_primary);
    assert.deepEqual(
      selectPublicGalleryImages(extras, { isClaimed: false }),
      []
    );
  });

  it("puts a stored primary before the original listing photo", () => {
    const images = selectPublicGalleryImages(
      [{ image_id: "upload", is_primary: true, created_at: "2026-01-02T00:00:00Z" }],
      {
        isClaimed: true,
        isFeatured: false,
        imageUrl: "https://example.com/original.jpg",
      }
    );
    assert.deepEqual(images, [
      { image_id: "upload", is_primary: true, image_url: null, is_default: false },
      {
        image_id: "listing-default",
        is_primary: false,
        visible: true,
        is_default: true,
        image_url: "https://example.com/original.jpg",
      },
    ]);
  });

  it("puts the original listing photo first when it is primary", () => {
    const extras = rows.filter((row) => !row.is_primary);
    const images = selectPublicGalleryImages(extras, {
      isClaimed: true,
      isFeatured: false,
      imageUrl: "https://example.com/original.jpg",
    });
    assert.equal(images[0].image_id, "listing-default");
    assert.equal(images[0].is_primary, true);
    assert.equal(images[1].image_id, "older");
  });

  it("shows only the original listing photo for unclaimed listings with imageUrl", () => {
    const images = selectPublicGalleryImages(rows, {
      isClaimed: false,
      imageUrl: "https://example.com/original.jpg",
    });
    assert.equal(images.length, 1);
    assert.equal(images[0].image_id, "listing-default");
    assert.equal(images[0].image_url, "https://example.com/original.jpg");
  });

  it("ignores missing rows and empty input", () => {
    assert.deepEqual(selectPublicGalleryImages(null, { isClaimed: true }), []);
    assert.deepEqual(
      selectPublicGalleryImages([{ is_primary: true }], { isClaimed: true }),
      []
    );
  });

  it("omits the original listing photo when hideDefaultImage is set", () => {
    const images = selectPublicGalleryImages(
      [{ image_id: "upload", is_primary: true, created_at: "2026-01-02T00:00:00Z" }],
      {
        isClaimed: true,
        isFeatured: false,
        imageUrl: "https://example.com/original.jpg",
        hideDefaultImage: true,
      }
    );
    assert.deepEqual(images, [
      { image_id: "upload", is_primary: true, image_url: null, is_default: false },
    ]);
  });

  it("hides the default photo for unclaimed listings", () => {
    assert.deepEqual(
      selectPublicGalleryImages(rows, {
        isClaimed: false,
        imageUrl: "https://example.com/original.jpg",
        hideDefaultImage: true,
      }),
      []
    );
  });

  it("sorts non-primary photos by sort_order instead of upload time", () => {
    const orderedRows = [
      { image_id: "primary", is_primary: true, sort_order: 0, created_at: "2026-01-02T00:00:00Z" },
      { image_id: "newer", is_primary: false, sort_order: 0, created_at: "2026-01-03T00:00:00Z" },
      { image_id: "older", is_primary: false, sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
    ];

    assert.deepEqual(
      selectPublicGalleryImages(orderedRows, { isClaimed: true, isFeatured: true }),
      [
        { image_id: "primary", is_primary: true, image_url: null, is_default: false },
        { image_id: "newer", is_primary: false, image_url: null, is_default: false },
        { image_id: "older", is_primary: false, image_url: null, is_default: false },
      ]
    );
  });

  it("places the default listing photo using default_image_sort_order", () => {
    const images = selectPublicGalleryImages(
      [
        { image_id: "upload-a", is_primary: true, sort_order: 0, created_at: "2026-01-02T00:00:00Z" },
        { image_id: "upload-b", is_primary: false, sort_order: 2, created_at: "2026-01-03T00:00:00Z" },
      ],
      {
        isClaimed: true,
        isFeatured: true,
        imageUrl: "https://example.com/original.jpg",
        defaultImageSortOrder: 1,
      }
    );

    assert.deepEqual(
      images.map((image) => image.image_id),
      ["upload-a", "listing-default", "upload-b"]
    );
  });

  it("excludes hidden extras and does not let them consume a public slot", () => {
    const mixed = [
      { image_id: "primary", is_primary: true, created_at: "2026-01-02T00:00:00Z" },
      {
        image_id: "hidden-1",
        is_primary: false,
        is_hidden: true,
        created_at: "2026-01-03T00:00:00Z",
      },
      {
        image_id: "hidden-2",
        is_primary: false,
        is_hidden: true,
        created_at: "2026-01-04T00:00:00Z",
      },
      { image_id: "extra-a", is_primary: false, created_at: "2026-01-05T00:00:00Z" },
      { image_id: "extra-b", is_primary: false, created_at: "2026-01-06T00:00:00Z" },
    ];
    assert.deepEqual(
      selectPublicGalleryImages(mixed, { isClaimed: true, isFeatured: false }),
      [
        { image_id: "primary", is_primary: true, image_url: null, is_default: false },
        { image_id: "extra-a", is_primary: false, image_url: null, is_default: false },
        { image_id: "extra-b", is_primary: false, image_url: null, is_default: false },
      ]
    );
  });
});

describe("applyPublicCoverImage", () => {
  it("uses a visible stored primary as the cover", () => {
    const business = { image_url: "https://example.com/original.jpg" };
    applyPublicCoverImage(business, [
      { image_id: "upload", is_primary: true, is_hidden: false },
    ]);
    assert.equal(business.primary_image_id, "upload");
    assert.equal(business.image_url, "https://example.com/original.jpg");
  });

  it("ignores a hidden stored primary", () => {
    const business = { image_url: "https://example.com/original.jpg" };
    applyPublicCoverImage(business, [
      { image_id: "upload", is_primary: true, is_hidden: true },
    ]);
    assert.equal(business.primary_image_id, null);
    assert.equal(business.image_url, "https://example.com/original.jpg");
  });

  it("does not use the original listing photo when it is hidden", () => {
    const business = {
      image_url: "https://example.com/original.jpg",
      hide_default_image: true,
    };
    applyPublicCoverImage(business, [
      { image_id: "upload", is_primary: true, is_hidden: false },
    ]);
    assert.equal(business.primary_image_id, "upload");
    assert.equal(business.image_url, null);
  });
});

describe("withDefaultListingImage", () => {
  it("sorts hidden and default photos by sort_order after the primary", () => {
    const images = withDefaultListingImage(
      [
        {
          image_id: "hidden-early",
          is_primary: false,
          is_hidden: true,
          sort_order: 0,
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          image_id: "visible-extra",
          is_primary: false,
          is_hidden: false,
          sort_order: 1,
          created_at: "2026-01-02T00:00:00Z",
        },
        {
          image_id: "primary",
          is_primary: true,
          is_hidden: false,
          sort_order: 2,
          created_at: "2026-01-03T00:00:00Z",
        },
      ],
      {
        imageUrl: "https://example.com/original.jpg",
        hideDefaultImage: true,
        includeHiddenDefault: true,
        defaultImageSortOrder: 3,
      }
    );

    assert.deepEqual(
      images.map((image) => image.image_id),
      ["primary", "hidden-early", "visible-extra", "listing-default"]
    );
  });
});

describe("detectImageMime", () => {
  it("detects jpeg, png, and webp magic bytes", () => {
    assert.equal(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
    assert.equal(
      detectImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0])),
      "image/png"
    );
    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0);
    webp.write("WEBP", 8);
    assert.equal(detectImageMime(webp), "image/webp");
  });

  it("returns null for unknown or short buffers", () => {
    assert.equal(detectImageMime(Buffer.from([0x00])), null);
    assert.equal(detectImageMime(Buffer.alloc(12)), null);
  });
});

describe("formatAdminGalleryImages", () => {
  it("includes hidden extras and the default listing photo", () => {
    const gallery = formatAdminGalleryImages({
      id: "11111111-1111-1111-1111-111111111111",
      image_url: "https://example.com/default.jpg",
      hide_default_image: false,
      is_claimed: true,
      is_featured: false,
      business_images: [
        {
          image_id: "22222222-2222-2222-2222-222222222222",
          is_primary: true,
          is_hidden: false,
          created_at: "2026-01-02T00:00:00Z",
        },
        {
          image_id: "33333333-3333-3333-3333-333333333333",
          is_primary: false,
          is_hidden: true,
          created_at: "2026-01-03T00:00:00Z",
        },
      ],
    });

    assert.equal(gallery[0].is_primary, true);
    assert.equal(gallery.some((image) => image.is_default), true);
    assert.equal(
      gallery.find((image) => image.is_hidden)?.image_id,
      "33333333-3333-3333-3333-333333333333"
    );
    assert.equal(
      gallery.find((image) => image.is_default)?.image_url,
      "https://example.com/default.jpg"
    );
  });
});
