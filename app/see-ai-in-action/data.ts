// Sample data for a fictional shop. Nothing here is a real business or real customer.

export type Product = {
  id: string;
  name: string;
  unit: string;
  short: string; // short unit for order amounts
  stock: number;
  caseSize: number; // supplier sells in cases of this many
  leadDays: number; // days the supplier takes to deliver
  weekly: number[]; // units sold per week, oldest first (last 8 weeks)
  carnivalBoost: number; // extra demand in a busy week (0.4 = +40%)
};

export const SHOP = "Island Pantry";

export const PRODUCTS: Product[] = [
  { id: "coconut", name: "Coconut Water", unit: "330 ml bottles", short: "bottles", stock: 38, caseSize: 24, leadDays: 7, weekly: [52, 55, 58, 61, 63, 68, 71, 76], carnivalBoost: 0.6 },
  { id: "sorrel", name: "Sorrel Drink", unit: "1 L bottles", short: "bottles", stock: 30, caseSize: 12, leadDays: 10, weekly: [14, 15, 17, 20, 24, 27, 31, 34], carnivalBoost: 0.3 },
  { id: "pepper", name: "Pepper Sauce", unit: "150 ml jars", short: "jars", stock: 96, caseSize: 12, leadDays: 14, weekly: [18, 17, 19, 18, 20, 19, 18, 19], carnivalBoost: 0.2 },
  { id: "plantain", name: "Plantain Chips", unit: "bags", short: "bags", stock: 22, caseSize: 20, leadDays: 5, weekly: [30, 28, 31, 29, 33, 32, 34, 36], carnivalBoost: 0.5 },
  { id: "kurma", name: "Kurma Snack Packs", unit: "packs", short: "packs", stock: 140, caseSize: 30, leadDays: 6, weekly: [22, 20, 19, 18, 17, 16, 15, 14], carnivalBoost: 0.3 },
  { id: "mauby", name: "Mauby Syrup", unit: "bottles", short: "bottles", stock: 25, caseSize: 12, leadDays: 12, weekly: [9, 10, 9, 11, 10, 12, 11, 12], carnivalBoost: 0.1 },
  { id: "chadon", name: "Chadon Beni Seasoning", unit: "jars", short: "jars", stock: 58, caseSize: 24, leadDays: 9, weekly: [11, 12, 12, 13, 12, 14, 13, 14], carnivalBoost: 0.15 },
  { id: "cassava", name: "Cassava Chips", unit: "bags", short: "bags", stock: 15, caseSize: 20, leadDays: 5, weekly: [12, 13, 12, 14, 13, 15, 16, 17], carnivalBoost: 0.5 },
];

export type Customer = {
  id: string;
  name: string;
  usual: string; // what they normally buy
  usualQty: string;
  everyDays: number; // how often they usually order
  lastDaysAgo: number;
  channel: "WhatsApp" | "Email";
};

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Kezia", usual: "Sorrel Drink", usualQty: "6 bottles", everyDays: 14, lastDaysAgo: 23, channel: "WhatsApp" },
  { id: "c2", name: "Marcus", usual: "Coconut Water", usualQty: "2 cases", everyDays: 7, lastDaysAgo: 6, channel: "WhatsApp" },
  { id: "c3", name: "Anya", usual: "Pepper Sauce", usualQty: "4 jars", everyDays: 30, lastDaysAgo: 41, channel: "Email" },
  { id: "c4", name: "Devon", usual: "Plantain Chips", usualQty: "10 bags", everyDays: 10, lastDaysAgo: 9, channel: "WhatsApp" },
  { id: "c5", name: "Shelly-Ann", usual: "Mauby Syrup", usualQty: "3 bottles", everyDays: 21, lastDaysAgo: 34, channel: "WhatsApp" },
  { id: "c6", name: "Rajiv", usual: "Kurma Snack Packs", usualQty: "1 case", everyDays: 14, lastDaysAgo: 12, channel: "Email" },
];

/* ---------------- Forecasting ---------------- */

export type Settings = { coverWeeks: number; buffer: number; busyWeek: boolean };

export type Forecast = {
  product: Product;
  perWeek: number; // forecast units per week
  trend: number; // % change, recent 4 weeks vs earlier 4 weeks
  daysLeft: number;
  status: "now" | "soon" | "ok";
  order: number; // suggested units to order (whole cases)
  cases: number;
  reason: string;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function forecast(p: Product, s: Settings): Forecast {
  const w = p.weekly;
  // Weighted average of the last four weeks: recent weeks count more.
  const recent = w.slice(-4);
  const weights = [0.1, 0.2, 0.3, 0.4];
  let base = recent.reduce((sum, v, i) => sum + v * weights[i], 0);
  const early = w.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const late = recent.reduce((a, b) => a + b, 0) / 4;
  const trend = early ? (late - early) / early : 0;
  // Let a clear trend carry forward a little (capped so one odd week can't swing it).
  base *= 1 + Math.max(-0.15, Math.min(0.2, trend / 2));
  if (s.busyWeek) base *= 1 + p.carnivalBoost;
  const perWeek = Math.max(0.1, base);
  const perDay = perWeek / 7;
  const daysLeft = p.stock / perDay;

  const status: Forecast["status"] = daysLeft <= p.leadDays ? "now" : daysLeft <= p.leadDays + 7 ? "soon" : "ok";

  // Enough to cover the delivery wait plus the chosen weeks of cover, plus a safety buffer.
  const need = perDay * (p.leadDays + s.coverWeeks * 7) * (1 + s.buffer / 100) - p.stock;
  const cases = status !== "ok" && need > 0 ? Math.ceil(need / p.caseSize) : 0;
  const order = cases * p.caseSize;

  const trendTxt =
    Math.abs(trend) < 0.05 ? "steady" : trend > 0 ? `up ${Math.round(trend * 100)}%` : `down ${Math.round(-trend * 100)}%`;
  const days = Math.floor(daysLeft);
  let reason = `Selling about ${Math.round(perWeek)} a week (${trendTxt} over the last month). ${p.stock} in stock, which lasts about ${days} day${days === 1 ? "" : "s"}.`;
  if (status === "now") reason += ` Your supplier takes ${p.leadDays} days, so you'd run out before a new order arrives.`;
  else if (status === "soon") reason += ` Your supplier takes ${p.leadDays} days, so order within the next week to stay stocked.`;
  else reason += ` No need to reorder yet.`;

  return { product: p, perWeek: round1(perWeek), trend, daysLeft, status, order, cases, reason };
}

/* ---------------- Follow-ups ---------------- */

export function isOverdue(c: Customer) {
  return c.lastDaysAgo > c.everyDays * 1.2;
}

export function draftMessage(c: Customer) {
  const weeks = Math.round(c.lastDaysAgo / 7);
  const since = weeks >= 2 ? `about ${weeks} weeks` : `${c.lastDaysAgo} days`;
  return c.channel === "WhatsApp"
    ? `Hi ${c.name}! It's been ${since} since your last order of ${c.usual}. Would you like us to set aside your usual ${c.usualQty} this week? Just reply YES and we'll have them ready for you. 😊`
    : `Hi ${c.name},\n\nIt's been ${since} since your last order of ${c.usual}. Would you like us to set aside your usual ${c.usualQty}? Reply to this email and we'll have your order ready.\n\nThanks,\n${SHOP}`;
}
