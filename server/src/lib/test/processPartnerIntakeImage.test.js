import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sharp from "sharp";
import { processPartnerIntakeImage } from "../processPartnerIntakeImage.js";

describe("processPartnerIntakeImage", () => {
  it("converts jpeg gallery photos to webp, resizes, and strips metadata", async () => {
    const input = await sharp({
      create: {
        width: 3200,
        height: 2000,
        channels: 3,
        background: { r: 200, g: 40, b: 40 },
      },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Copyright: "test-shop" } } })
      .toBuffer();

    const result = await processPartnerIntakeImage(input, { kind: "gallery" });
    assert.equal(result.contentType, "image/webp");
    assert.ok(result.byteSize > 0);
    assert.ok(result.width <= 2400);
    assert.ok(result.height <= 2400);

    const outMeta = await sharp(result.buffer).metadata();
    assert.equal(outMeta.format, "webp");
    assert.equal(outMeta.exif, undefined);
  });

  it("keeps alpha when converting logos to webp", async () => {
    const input = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();

    const result = await processPartnerIntakeImage(input, { kind: "logo" });
    assert.equal(result.contentType, "image/webp");
    assert.ok(result.width <= 1024);

    const outMeta = await sharp(result.buffer).metadata();
    assert.equal(outMeta.format, "webp");
    assert.equal(outMeta.hasAlpha, true);
  });
});
