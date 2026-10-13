import type { CreditLine, Store } from "./demo-data";
export const roundMoney = (n: number) =>
  Math.round((n + Number.EPSILON) * 100) / 100;
export function aggregateBusinessLines(
  data: Pick<Store, "events">,
  from: string,
  to: string,
) {
  const groups = new Map<string, CreditLine>();
  for (const event of data.events.filter(
    (e) => e.type === "Credit" && e.date >= from && e.date <= to,
  )) {
    for (const line of event.lines) {
      const key = [
        line.productId,
        line.category,
        line.name,
        line.brand,
        line.batch,
        line.purchasePrice,
        line.discountedPrice ?? line.sellingPrice,
        line.unit,
      ].join("|");
      const old = groups.get(key);
      groups.set(
        key,
        old
          ? {
              ...old,
              quantity: roundMoney(old.quantity + line.quantity),
              total: roundMoney(old.total + line.total),
            }
          : { ...line },
      );
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );
}
