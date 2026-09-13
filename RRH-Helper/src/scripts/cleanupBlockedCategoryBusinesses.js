/**
 * Cleanup blocked categories in Supabase:
 * 1. Delete unclaimed businesses whose PRIMARY category is blocked junk
 * 2. Unlink blocked secondary categories from all businesses (claimed kept)
 * 3. Prune empty blocked / unlink category rows
 *
 * Claimed businesses are never deleted.
 *
 * Usage:
 *   npm run cleanup-blocked-categories-dev-dry
 *   npm run cleanup-blocked-categories-dev
 *   npm run cleanup-blocked-categories-prod-dry
 *   npm run cleanup-blocked-categories-prod
 */
import {
  createSupabaseClient,
  logSupabaseTarget,
} from "./supabaseClient.js";
import {
  BLOCKED_EXACT_CATEGORIES,
  SECONDARY_UNLINK_CATEGORIES,
  isDeletePrimaryCategory,
  isSecondaryUnlinkCategory,
  shouldDeleteBusinessForPrimaryCategory,
} from "../../../server/src/ingest/categoryBlocklist.js";

const dryRun = process.argv.includes("--dry-run");
const supabase = createSupabaseClient();
const PAGE_SIZE = 1000;
const DELETE_CHUNK = 100;

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function fetchAllRows(table, select, applyQuery = (q) => q) {
  const rows = [];
  let from = 0;

  for (;;) {
    let query = supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1);
    query = applyQuery(query);
    const { data, error } = await query;
    if (error) throw error;
    const batch = data || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function deleteByBusinessIds(businessIds) {
  if (businessIds.length === 0) return;

  for (const ids of chunk(businessIds, DELETE_CHUNK)) {
    const { error: secondaryError } = await supabase
      .from("business_secondary_categories")
      .delete()
      .in("business_id", ids);
    if (secondaryError) throw secondaryError;

    const { error: featuresError } = await supabase
      .from("business_features")
      .delete()
      .in("business_id", ids);
    if (featuresError) throw featuresError;

    const { error: hoursError } = await supabase
      .from("business_hours")
      .delete()
      .in("business_id", ids);
    if (hoursError) throw hoursError;

    const { error: businessError } = await supabase
      .from("businesses")
      .delete()
      .in("id", ids);
    if (businessError) throw businessError;
  }
}

async function main() {
  logSupabaseTarget();
  console.log(
    `Delete-primary list: ${BLOCKED_EXACT_CATEGORIES.length} exact (+ HVAC substrings)`,
  );
  console.log(
    `Secondary-unlink list: ${SECONDARY_UNLINK_CATEGORIES.length} exact`,
  );
  console.log(dryRun ? "Mode: DRY RUN (no deletes)" : "Mode: LIVE DELETE");

  const primaryCategories = await fetchAllRows(
    "primary_categories",
    "id, name, slug",
  );
  const secondaryCategories = await fetchAllRows(
    "secondary_categories",
    "id, name, slug",
  );

  const deletePrimaries = primaryCategories.filter((c) =>
    isDeletePrimaryCategory(c.name),
  );
  const unlinkSecondaries = secondaryCategories.filter((c) =>
    isSecondaryUnlinkCategory(c.name),
  );

  console.log(`\nPrimary categories that trigger delete: ${deletePrimaries.length}`);
  deletePrimaries.forEach((c) => console.log(`  - ${c.name}`));
  console.log(
    `Secondary categories to unlink: ${unlinkSecondaries.length}`,
  );
  unlinkSecondaries.forEach((c) => console.log(`  - ${c.name}`));

  const deletePrimaryIds = deletePrimaries.map((c) => c.id);
  const primaryNameById = new Map(deletePrimaries.map((c) => [c.id, c.name]));
  const unlinkSecondaryIds = unlinkSecondaries.map((c) => c.id);
  const secondaryNameById = new Map(
    unlinkSecondaries.map((c) => [c.id, c.name]),
  );

  const toDelete = [];
  const claimedSkipped = [];

  if (deletePrimaryIds.length > 0) {
    for (const ids of chunk(deletePrimaryIds, 50)) {
      const businesses = await fetchAllRows(
        "businesses",
        "id, title, slug, is_claimed, primary_category_id",
        (q) => q.in("primary_category_id", ids),
      );

      for (const biz of businesses) {
        const reason = primaryNameById.get(biz.primary_category_id) || "?";
        if (biz.is_claimed) {
          claimedSkipped.push({
            id: biz.id,
            title: biz.title,
            slug: biz.slug,
            reason,
          });
          continue;
        }
        if (
          !shouldDeleteBusinessForPrimaryCategory({
            title: biz.title,
            categoryName: reason,
          })
        ) {
          claimedSkipped.push({
            id: biz.id,
            title: biz.title,
            slug: biz.slug,
            reason: `${reason} (kept — title looks auto/radiator)`,
          });
          continue;
        }
        toDelete.push({
          id: biz.id,
          title: biz.title,
          slug: biz.slug,
          reason,
        });
      }
    }
  }

  const secondaryLinksToUnlink = [];

  if (unlinkSecondaryIds.length > 0) {
    for (const ids of chunk(unlinkSecondaryIds, 50)) {
      const links = await fetchAllRows(
        "business_secondary_categories",
        "business_id, secondary_category_id",
        (q) => q.in("secondary_category_id", ids),
      );
      for (const link of links) {
        secondaryLinksToUnlink.push({
          business_id: link.business_id,
          secondary_category_id: link.secondary_category_id,
          category: secondaryNameById.get(link.secondary_category_id) || "?",
        });
      }
    }
  }

  // Don't bother unlinking secondaries on businesses we're about to delete
  const deleteIdSet = new Set(toDelete.map((b) => b.id));
  const unlinkAfterDelete = secondaryLinksToUnlink.filter(
    (l) => !deleteIdSet.has(l.business_id),
  );

  console.log(`\nUnclaimed businesses to delete: ${toDelete.length}`);
  toDelete.forEach((b) => {
    console.log(`  - ${b.title} [primary:${b.reason}]`);
  });

  console.log(
    `Claimed / protected businesses skipped: ${claimedSkipped.length}`,
  );
  claimedSkipped.forEach((b) => {
    console.log(`  - ${b.title} [primary:${b.reason}]`);
  });

  console.log(
    `Secondary links to unlink (kept businesses): ${unlinkAfterDelete.length}`,
  );
  const unlinkCounts = new Map();
  for (const link of unlinkAfterDelete) {
    unlinkCounts.set(link.category, (unlinkCounts.get(link.category) || 0) + 1);
  }
  [...unlinkCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => console.log(`  - ${name}: ${count}`));

  if (dryRun) {
    console.log("\nDry run complete — no rows changed.");
    return;
  }

  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} unclaimed businesses...`);
    await deleteByBusinessIds(toDelete.map((b) => b.id));
    console.log(`✅ Deleted ${toDelete.length} businesses`);
  } else {
    console.log("\n⏭️  No unclaimed businesses to delete");
  }

  if (unlinkAfterDelete.length > 0) {
    console.log(
      `\nUnlinking ${unlinkAfterDelete.length} blocked secondary links...`,
    );
    for (const batch of chunk(unlinkAfterDelete, DELETE_CHUNK)) {
      // Delete by pairs — supabase doesn't support multi-column IN easily
      await Promise.all(
        batch.map(async (link) => {
          const { error } = await supabase
            .from("business_secondary_categories")
            .delete()
            .eq("business_id", link.business_id)
            .eq("secondary_category_id", link.secondary_category_id);
          if (error) throw error;
        }),
      );
    }
    console.log(`✅ Unlinked ${unlinkAfterDelete.length} secondary links`);
  } else {
    console.log("⏭️  No secondary links to unlink");
  }

  // Prune empty categories from both lists
  const prunePrimaries = primaryCategories.filter((c) =>
    isDeletePrimaryCategory(c.name),
  );
  const pruneSecondaries = secondaryCategories.filter((c) =>
    isSecondaryUnlinkCategory(c.name),
  );

  const emptyPrimaryIds = [];
  for (const cat of prunePrimaries) {
    const { count, error } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("primary_category_id", cat.id);
    if (error) throw error;
    if ((count ?? 0) === 0) emptyPrimaryIds.push(cat.id);
  }

  const emptySecondaryIds = [];
  for (const cat of pruneSecondaries) {
    const { count, error } = await supabase
      .from("business_secondary_categories")
      .select("business_id", { count: "exact", head: true })
      .eq("secondary_category_id", cat.id);
    if (error) throw error;
    if ((count ?? 0) === 0) emptySecondaryIds.push(cat.id);
  }

  if (emptyPrimaryIds.length > 0) {
    for (const ids of chunk(emptyPrimaryIds, DELETE_CHUNK)) {
      const { error } = await supabase
        .from("primary_categories")
        .delete()
        .in("id", ids);
      if (error) throw error;
    }
    console.log(`✅ Deleted ${emptyPrimaryIds.length} empty primary categories`);
  } else {
    console.log("⏭️  No empty blocked primary categories to delete");
  }

  if (emptySecondaryIds.length > 0) {
    for (const ids of chunk(emptySecondaryIds, DELETE_CHUNK)) {
      const { error } = await supabase
        .from("secondary_categories")
        .delete()
        .in("id", ids);
      if (error) throw error;
    }
    console.log(
      `✅ Deleted ${emptySecondaryIds.length} empty secondary categories`,
    );
  } else {
    console.log("⏭️  No empty blocked secondary categories to delete");
  }

  console.log("\n✅ Cleanup complete");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
