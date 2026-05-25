/** Responsive, compressed image URLs for product UI (Unsplash + Supabase-friendly). */

export type ProductImageSize = "thumb" | "card" | "detail" | "hero";

const SIZE: Record<ProductImageSize, { w: number; q: number }> = {
  thumb: { w: 96, q: 72 },
  card: { w: 420, q: 78 },
  detail: { w: 800, q: 82 },
  hero: { w: 1200, q: 85 },
};

export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholder-product.svg";

export function optimizeProductImageUrl(
  src: string | null | undefined,
  size: ProductImageSize = "card",
): string {
  if (!src?.trim()) return PRODUCT_IMAGE_PLACEHOLDER;
  const url = src.trim();
  if (url.startsWith("/") || url.startsWith("data:")) return url;

  const { w, q } = SIZE[size];

  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?w=${w}&q=${q}&auto=format&fit=crop`;
  }

  if (url.includes("supabase.co/storage/v1/object/public")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}width=${w}&quality=${q}`;
  }

  return url;
}

/** srcset for detail hero — smaller files on mobile */
export function productImageSrcSet(src: string | null | undefined): string | undefined {
  if (!src?.includes("images.unsplash.com")) return undefined;
  const base = src.split("?")[0];
  return [
    `${base}?w=480&q=78&auto=format&fit=crop 480w`,
    `${base}?w=800&q=82&auto=format&fit=crop 800w`,
    `${base}?w=1200&q=85&auto=format&fit=crop 1200w`,
  ].join(", ");
}

export function buildProductGalleryImages(
  imageUrl: string | null | undefined,
  galleryUrls?: string[] | null,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (u: string | null | undefined) => {
    const key = u?.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };

  add(imageUrl);
  for (const u of galleryUrls ?? []) add(u);

  if (out.length === 1 && out[0].includes("images.unsplash.com")) {
    const base = out[0].split("?")[0];
    const variants = [
      `${base}?w=800&q=82&auto=format&fit=crop`,
      `${base}?w=800&q=82&auto=format&fit=crop&crop=entropy`,
      `${base}?w=800&q=80&auto=format&fit=crop&crop=edges`,
      `${base}?w=800&q=78&auto=format&fit=crop&sat=-20`,
      `${base}?w=800&q=85&auto=format&fit=crop&blur=0`,
    ];
    return variants;
  }

  return out.length ? out : [PRODUCT_IMAGE_PLACEHOLDER];
}
