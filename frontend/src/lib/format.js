export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPrice(price) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export function toDateInputValue(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
