import type { AccountEvent, InterestEntry } from "./demo-data";
export function simplifyInterestHistory(history: InterestEntry[], events: AccountEvent[]): InterestEntry[];
export function interestReason(entry: InterestEntry): string;
export function interestTitle(entry: InterestEntry): string;
