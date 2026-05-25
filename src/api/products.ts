import { supabase } from "@/integrations/supabase/client";
import { getCategoryFilterValues, productMatchesCategory } from "@/lib/categories";
import { getMockProductBySlug, MOCK_PRODUCTS } from "@/lib/mock-products";
import type { ProductRow } from "@/types/commerce";

function filterMockProducts(opts?: { category?: string; limit?: number }) {
  let list = MOCK_PRODUCTS;
  if (opts?.category) list = list.filter((p) => productMatchesCategory(p.category, opts.category));
  if (opts?.limit) list = list.slice(0, opts.limit);
  return list;
}

const LIST_FIELDS =
  "id,title,slug,price_pkr,image_url,category,manufacturer,discount_pct,availability,rating,stock,color";

export async function fetchProducts(opts?: { category?: string; limit?: number }) {
  let q = supabase.from("products").select(LIST_FIELDS);
  if (opts?.category) {
    const values = getCategoryFilterValues(opts.category);
    q = values.length === 1 ? q.eq("category", values[0]) : q.in("category", values);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  try {
    const { data, error } = await q;
    if (error) throw error;
    if (data?.length) return data as ProductRow[];
  } catch {
    /* demo catalog */
  }
  return filterMockProducts(opts);
}

export async function fetchProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (data) return data as ProductRow;
  } catch {
    /* fallback to demo catalog */
  }
  return getMockProductBySlug(slug);
}

export async function fetchRelatedProducts(category: string, excludeId: string, limit = 4) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(LIST_FIELDS)
      .eq("category", category)
      .neq("id", excludeId)
      .limit(limit);
    if (error) throw error;
    if (data?.length) return data as ProductRow[];
  } catch {
    /* mock */
  }
  return MOCK_PRODUCTS.filter(
    (p) => p.id !== excludeId && productMatchesCategory(p.category, category),
  ).slice(0, limit);
}

export async function upsertProduct(payload: Partial<ProductRow> & { title: string; category: string }) {
  const { id, availability, ...rest } = payload;
  const row = {
    ...rest,
    gallery_urls: rest.gallery_urls ?? undefined,
    specs: rest.specs ?? undefined,
    ...(availability ? { availability: availability as "in_stock" | "on_demand" | "coming_soon" | "obsolete" } : {}),
  };
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) throw error;
    return id;
  }
  const slug = row.slug ?? row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data, error } = await supabase.from("products").insert({ ...row, slug }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
