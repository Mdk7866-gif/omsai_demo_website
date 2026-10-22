const labels = {
  credit: "New credit",
  payment: "Payment",
  settings: "Settings change",
  compound: "Compounding",
};

// Merge display-only reporting slices without recalculating or losing money.
export function simplifyInterestHistory(history, events) {
  const triggers = new Map();
  const key = (farmer, date) => `${farmer}:${date}`;
  for (const event of events) triggers.set(key(event.farmer, event.date), event.type === "Credit" ? "credit" : "payment");
  for (const entry of history) {
    if (entry.type === "Capitalization") triggers.set(key(entry.farmer, entry.date), entry.oldCompound ? "compound" : "settings");
    if (entry.type === "Settings") triggers.set(key(entry.farmer, entry.date), "settings");
  }
  const ordered = [...history].sort((a, b) => a.farmer - b.farmer || a.date.localeCompare(b.date) || a.id - b.id);
  const result = [];
  for (const entry of ordered) {
    const old = result.at(-1);
    if (entry.type === "Accrual" && old?.type === "Accrual" && old.farmer === entry.farmer && old.to === entry.from && old.newRate === entry.newRate && old.newCompound === entry.newCompound && !triggers.has(key(entry.farmer, entry.from))) {
      result[result.length - 1] = { ...old, date: entry.date, to: entry.to, amount: Math.round((old.amount + entry.amount + Number.EPSILON) * 100) / 100 };
    } else result.push({ ...entry });
  }
  return result.map(entry => {
    if (entry.type !== "Accrual") return { ...entry, reason: entry.type === "Settings" || !entry.oldCompound ? "settings" : "compound", ongoing: false };
    const endReason = triggers.get(key(entry.farmer, entry.to));
    const startReason = triggers.get(key(entry.farmer, entry.from));
    return { ...entry, reason: endReason ?? startReason ?? "credit", ongoing: !endReason };
  });
}

export function interestReason(entry) {
  const label = labels[entry.reason] ?? (entry.type === "Settings" ? labels.settings : labels.compound);
  return entry.ongoing ? `Since ${label.toLowerCase()}` : label;
}

export function interestTitle(entry) {
  return entry.type === "Settings" ? "Interest settings changed" : entry.type === "Capitalization" ? "Interest added to principal" : entry.ongoing ? "Interest so far" : "Interest added";
}
