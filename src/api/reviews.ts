import { supabase } from "@/integrations/supabase/client";
import { getMockReviewsForProduct } from "@/lib/mock-data";
import type { ProductReview } from "@/types/commerce";

export async function fetchProductReviews(productId: string) {
  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data?.length) return data as ProductReview[];
  } catch {
    /* demo */
  }
  return getMockReviewsForProduct(productId);
}

export async function submitProductReview(input: {
  product_id: string;
  customer_name: string;
  rating: number;
  body: string;
  user_id?: string | null;
}) {
  const { error } = await supabase.from("product_reviews").insert({
    ...input,
    verified: !!input.user_id,
  });
  if (error) throw error;
}
