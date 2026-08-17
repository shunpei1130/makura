export function formatYen(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function daysRemaining(value: string) {
  const difference = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(difference / 86_400_000));
}
