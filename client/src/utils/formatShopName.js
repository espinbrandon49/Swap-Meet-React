export default function formatShopName(name) {
  if (!name || typeof name !== "string") return "Storefront";

  return name
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}