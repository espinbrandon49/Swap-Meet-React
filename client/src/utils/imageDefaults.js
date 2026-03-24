// client/src/utils/imageDefaults.js

// ----------------------------------------
// Stable fallback images (NO Picsum)
// ----------------------------------------

export const PRODUCT_FALLBACK =
  "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80";

export const SHOP_FALLBACK =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";

export const DASHBOARD_PREVIEW_FALLBACK = PRODUCT_FALLBACK;

// ----------------------------------------
// Helpers
// ----------------------------------------

export function getSafeProductImage(imageUrl) {
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.trim();
  }
  return PRODUCT_FALLBACK;
}