import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOGS_DIR = path.join(process.cwd(), "content", "blogs");

function getMdxFiles() {
  if (!fs.existsSync(BLOGS_DIR)) return [];

  return fs
    .readdirSync(BLOGS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .sort();
}

function normalizeAffiliateList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function parseBlogFile(filename) {
  const slug = filename.replace(/\.mdx$/, "");
  const filePath = path.join(BLOGS_DIR, filename);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const affiliate = data.affiliateProducts ?? {};

  return {
    slug,
    content,
    metadata: {
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      author: data.author ?? "RadiatorRepairHub",
      affiliateProducts: {
        recommended: normalizeAffiliateList(affiliate.recommended),
        related: normalizeAffiliateList(affiliate.related),
      },
    },
  };
}

export function getAllBlogPosts() {
  return getMdxFiles()
    .map(parseBlogFile)
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    );
}

export function getBlogPostBySlug(slug) {
  const filename = `${slug}.mdx`;
  const filePath = path.join(BLOGS_DIR, filename);

  if (!fs.existsSync(filePath)) return null;

  return parseBlogFile(filename);
}

export function getBlogSlugs() {
  return getMdxFiles().map((file) => file.replace(/\.mdx$/, ""));
}
