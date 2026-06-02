import { supabase } from "@/integrations/supabase/client";
import { estimateDeliveryDate } from "@/lib/order-fulfillment";
import { getMockOrderWithItems, MOCK_ORDERS_WITH_ITEMS } from "@/lib/mock-data";
import type { ItemFulfillmentStatus, OrderStatus } from "@/lib/order-fulfillment";
import type { OrderRow, OrderWithItems } from "@/types/commerce";

export async function fetchOrders(opts?: { userId?: string }) {
  let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (opts?.userId) q = q.eq("user_id", opts.userId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function fetchOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  try {
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error) throw error;
    if (order) {
      const { data: items, error: iErr } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("title");
      if (iErr) throw iErr;
      return { ...(order as OrderRow), items: items ?? [] };
    }
  } catch {
    /* demo */
  }
  return getMockOrderWithItems(orderId);
}

export async function fetchOrdersWithItems(opts?: { userId?: string }): Promise<OrderWithItems[]> {
  try {
    const orders = await fetchOrders(opts);
    if (!orders.length) return MOCK_ORDERS_WITH_ITEMS;
    const out: OrderWithItems[] = [];
    for (const o of orders) {
      const full = await fetchOrderWithItems(o.id);
      if (full) out.push(full);
    }
    return out.length ? out : MOCK_ORDERS_WITH_ITEMS;
  } catch {
    return MOCK_ORDERS_WITH_ITEMS;
  }
}

export async function placeOrder(input: {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postal_code?: string;
  landmark?: string;
  total_pkr: number;
  subtotal_pkr?: number;
  shipping_pkr?: number;
  tax_pkr?: number;
  payment_fee_pkr?: number;
  delivery_method?: string;
  discount_pkr?: number;
  voucher_code?: string | null;
  payment_method: string;
  user_id?: string | null;
  items: {
    product_id: string;
    title: string;
    price_pkr: number;
    quantity: number;
    image_url?: string | null;
    product_slug?: string;
  }[];
}) {
  const { items, delivery_method, ...order } = input;
  const orderedAt = new Date();
  const expected = estimateDeliveryDate(delivery_method ?? "standard", orderedAt);

  const { data: created, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      expected_delivery_at: expected.toISOString(),
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;

  const { error: e2 } = await supabase.from("order_items").insert(
    items.map((i) => ({
      product_id: i.product_id,
      title: i.title,
      price_pkr: i.price_pkr,
      quantity: i.quantity,
      order_id: created.id,
      fulfillment_status: "pending",
      expected_delivery_at: expected.toISOString(),
      image_url: i.image_url ?? null,
      product_slug: i.product_slug ?? null,
    })),
  );
  if (e2) throw e2;

  // Increment voucher used_count if a voucher was applied
  if (input.voucher_code) {
    await supabase.rpc("increment_voucher_use", { voucher_code: input.voucher_code }).catch(() => {
      // Non-fatal: fallback to manual increment
      supabase
        .from("vouchers")
        .select("id, used_count")
        .eq("code", input.voucher_code!)
        .maybeSingle()
        .then(({ data: v }) => {
          if (v) supabase.from("vouchers").update({ used_count: (v.used_count ?? 0) + 1 }).eq("id", v.id);
        });
    });
  }

  return created as OrderRow;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateOrderTracking(
  id: string,
  patch: { tracking_number?: string; expected_delivery_at?: string; admin_notes?: string },
) {
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateOrderItemFulfillment(
  itemId: string,
  fulfillment_status: ItemFulfillmentStatus,
  dispatched_at?: string | null,
) {
  const patch: Record<string, unknown> = { fulfillment_status };
  if (fulfillment_status === "dispatched" || fulfillment_status === "in_transit") {
    patch.dispatched_at = dispatched_at ?? new Date().toISOString();
  }
  const { error } = await supabase.from("order_items").update(patch).eq("id", itemId);
  if (error) throw error;
}
