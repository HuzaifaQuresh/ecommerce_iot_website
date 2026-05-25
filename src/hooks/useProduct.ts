import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug, fetchRelatedProducts } from "@/api/products";
import { fetchProductReviews } from "@/api/reviews";

export function useProduct(slug: string) {
  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });

  const reviews = useQuery({
    queryKey: ["reviews", product.data?.id],
    queryFn: () => fetchProductReviews(product.data!.id),
    enabled: !!product.data?.id,
  });

  const related = useQuery({
    queryKey: ["related", product.data?.category, product.data?.id],
    queryFn: () => fetchRelatedProducts(product.data!.category, product.data!.id),
    enabled: !!product.data?.category && !!product.data?.id,
  });

  return { product, reviews, related };
}
