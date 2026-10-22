import farmers from "../../dummy_data/farmers.json";
import products from "../../dummy_data/products.json";
import suppliers from "../../dummy_data/suppliers.json";
import events from "../../dummy_data/transactions.json";
import purchases from "../../dummy_data/purchases.json";
import invoices from "../../dummy_data/invoices.json";
import interestHistory from "../../dummy_data/interest_history.json";
import stockMovements from "../../dummy_data/stock_movements.json";
import shop from "../../dummy_data/shop.json";
export type Shop = Omit<typeof shop, "bank"> & { bank: typeof shop.bank & { isSample?: boolean } };
export const shopDetails: Shop = { ...shop, bank: { ...shop.bank } };
export function restoreShop(saved?: Shop): Shop {
  if (!saved) return structuredClone(shopDetails);
  const oldSample = saved.bank?.account === "XXXXXX48271 (sample)";
  return { ...shopDetails, ...saved, bank: oldSample ? { ...shopDetails.bank } : { ...shopDetails.bank, ...saved.bank } };
}

export type Section =
  "Dashboard" | "Farmers" | "Products" | "Invoices" | "Suppliers";
export type Farmer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  due: number;
  principal: number;
  interest: number;
  rate: number;
  compound: boolean;
  created: string;
  archived: boolean;
  aadhaar?: string;
};
export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  stock: number;
  unit: string;
  purchasePrice: number;
  price: number;
  batch: string;
  expiry: string;
  archived: boolean;
};
export type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  archived: boolean;
};
export type CreditLine = {
  productId: number | null;
  name: string;
  brand: string;
  category: string;
  batch: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  discountedPrice: number | null;
  total: number;
};
export type AccountEvent = {
  id: number;
  farmer: number;
  name: string;
  type: "Payment" | "Credit";
  amount: number;
  date: string;
  time: string;
  detail: string;
  lines: CreditLine[];
  dueBefore: number;
  dueAfter: number;
  interestPaid?: number;
  principalPaid?: number;
};
export type Purchase = {
  id: number;
  supplier: number;
  name: string;
  amount: number;
  date: string;
  paid: boolean;
  detail: string;
  lines: CreditLine[];
  statusHistory: { date: string; paid: boolean }[];
};
export type InterestEntry = {
  id: number;
  farmer: number;
  date: string;
  type: "Settings" | "Accrual" | "Capitalization";
  oldRate: number;
  newRate: number;
  oldCompound: boolean;
  newCompound: boolean;
  amount: number;
  from: string;
  to: string;
  note: string;
};
export type Invoice = {
  shop?: Shop;
  includeHistory?: boolean;
  id: number;
  farmer: number;
  name: string;
  phone: string;
  address: string;
  date: string;
  due: number;
  principal: number;
  interest: number;
  rate: number;
  compound: boolean;
  events: AccountEvent[];
  interestHistory: InterestEntry[];
};
export type StockMovement = {
  id: number;
  product: number;
  date: string;
  time: string;
  direction: "In" | "Out";
  quantity: number;
  reason: string;
};
export type Store = {
  shop?: Shop;
  farmers: Farmer[];
  products: Product[];
  suppliers: Supplier[];
  events: AccountEvent[];
  purchases: Purchase[];
  invoices: Invoice[];
  interestHistory: InterestEntry[];
  stockMovements: StockMovement[];
};
export type Modal = { kind: string; id?: number } | null;
export const seed = {
  shop: shopDetails,
  farmers,
  products,
  suppliers,
  events,
  purchases,
  invoices,
  interestHistory,
  stockMovements,
} as Store;
export const DAY = "2026-10-22";
export const STORAGE_KEY = "omsai-demo-v5-season";
export const PROFILE_STORAGE_KEY = "omsai-company-profile-v1";
export const money = (n: number) =>
  "₹" +
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const round = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
export const dateLabel = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
export const fractionalUnit = (unit: string) =>
  ["kg", "kilograms", "litres", "liters", "l"].includes(unit.toLowerCase());
export const creditCost = (e: AccountEvent) =>
  round(e.lines.reduce((s, l) => s + l.quantity * l.purchasePrice, 0));
export const eventOrder = (e: AccountEvent) => {
  const [clock, period] = e.time.toUpperCase().split(" ");
  const [h, m] = clock.split(":").map(Number);
  return new Date(
    `${e.date}T${String((h % 12) + (period === "PM" ? 12 : 0)).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
  ).getTime();
};
export const nextRecordId = (s: Store) =>
  Math.max(
    0,
    ...s.events.map((e) => e.id),
    ...s.stockMovements.map((e) => e.id),
    ...s.interestHistory.map((e) => e.id),
    ...s.farmers.map((e) => e.id),
    ...s.products.map((e) => e.id),
    ...s.suppliers.map((e) => e.id),
    ...s.purchases.map((e) => e.id),
  ) + 1;
export function nextDemoTime(s: Store) {
  const times = [...s.events, ...s.stockMovements].filter(e => e.date === DAY).map(e => {
    const [clock, period] = e.time.toUpperCase().split(" ");
    const [h, m] = clock.split(":").map(Number);
    return (h % 12 + (period === "PM" ? 12 : 0)) * 60 + m;
  });
  const minutes = Math.min(1439, Math.max(8 * 60, ...times) + 1);
  const hour = Math.floor(minutes / 60);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
export function createInvoice(s: Store, farmer: Farmer, includeHistory = false): Invoice {
  return {
    shop: structuredClone(s.shop ?? shopDetails),
    includeHistory,
    id: Math.max(100, ...s.invoices.map((i) => i.id)) + 1,
    farmer: farmer.id,
    name: farmer.name,
    phone: farmer.phone,
    address: farmer.address,
    date: DAY,
    due: farmer.due,
    principal: farmer.principal,
    interest: farmer.interest,
    rate: farmer.rate,
    compound: farmer.compound,
    events: structuredClone(s.events.filter((e) => e.farmer === farmer.id)),
    interestHistory: structuredClone(
      s.interestHistory.filter((e) => e.farmer === farmer.id),
    ),
  };
}
