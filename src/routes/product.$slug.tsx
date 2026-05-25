import { createFileRoute, redirect } from "@tanstack/react-router";

/** Daraz-style short URL alias: /product/:slug → /products/:slug */
export const Route = createFileRoute("/product/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/products/$slug", params: { slug: params.slug } });
  },
});
