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

function normalizeTopics(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === "string" ? item.trim().toLowerCase() : ""
    )
    .filter(Boolean);
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
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
      topics: normalizeTopics(data.topics),
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

/**
 * Pick related posts by topic overlap with business category names.
 * Fills with newest posts when fewer than `limit` matches.
 */
export function getRelatedBlogPosts({
  categoryNames = [],
  limit = 3,
} = {}) {
  const posts = getAllBlogPosts();
  if (!posts.length || limit <= 0) return [];

  const categoryTokens = new Set(
    categoryNames.flatMap((name) => tokenize(name))
  );

  // Cooling-focused defaults help generic auto-repair shops still get useful guides.
  if (categoryTokens.size === 0) {
    ["radiator", "coolant", "overheating", "repair"].forEach((token) =>
      categoryTokens.add(token)
    );
  }

  const scored = posts.map((post) => {
    const topics = post.metadata.topics || [];
    let score = 0;

    for (const topic of topics) {
      const topicTokens = tokenize(topic);
      if (topicTokens.some((token) => categoryTokens.has(token))) {
        score += 2;
      }
      if (categoryTokens.has(topic)) {
        score += 1;
      }
    }

    // Soft boost when title/description shares category tokens.
    const textTokens = new Set([
      ...tokenize(post.metadata.title),
      ...tokenize(post.metadata.description),
    ]);
    for (const token of categoryTokens) {
      if (textTokens.has(token)) score += 0.5;
    }

    return { post, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      new Date(b.post.metadata.date).getTime() -
      new Date(a.post.metadata.date).getTime()
    );
  });

  const related = [];
  const used = new Set();

  for (const entry of scored) {
    if (related.length >= limit) break;
    if (entry.score <= 0) continue;
    related.push(entry.post);
    used.add(entry.post.slug);
  }

  for (const post of posts) {
    if (related.length >= limit) break;
    if (used.has(post.slug)) continue;
    related.push(post);
    used.add(post.slug);
  }

  return related;
}
