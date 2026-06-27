/**
 * Enum values mirrored from the backend (docs/api_schemas.md + Prisma schema).
 * The backend strictly validates against these exact string values, so the UI
 * selects them via {label, value} option lists.
 */

export type AccountRole = "FOUNDER" | "INVESTOR";

export type FundingStage = "PRE_SEED" | "SEED" | "PRE_SERIES_A";

export type TRL = "IDEA" | "PROTOTYPE" | "PILOT" | "LIVE_PRODUCT" | "SCALING";

// NOTE: backend InvestorTypeEnum only accepts these three (no SYNDICATE).
export type InvestorType = "ANGEL" | "VC_FUND" | "FAMILY_OFFICE";

export interface EnumOption<T extends string> {
  label: string;
  value: T;
}

export const FUNDING_STAGE_OPTIONS: EnumOption<FundingStage>[] = [
  { label: "Pre-seed", value: "PRE_SEED" },
  { label: "Seed", value: "SEED" },
  { label: "Pre-Series A", value: "PRE_SERIES_A" },
];

export const TRL_OPTIONS: EnumOption<TRL>[] = [
  { label: "Idea", value: "IDEA" },
  { label: "Prototype", value: "PROTOTYPE" },
  { label: "Pilot", value: "PILOT" },
  { label: "Live product", value: "LIVE_PRODUCT" },
  { label: "Scaling", value: "SCALING" },
];

export const INVESTOR_TYPE_OPTIONS: EnumOption<InvestorType>[] = [
  { label: "Angel", value: "ANGEL" },
  { label: "VC Fund", value: "VC_FUND" },
  { label: "Family Office", value: "FAMILY_OFFICE" },
];

/** Map a list of selected labels back to their enum values (single source of truth). */
export function labelsToValues<T extends string>(
  options: EnumOption<T>[],
  labels: string[],
): T[] {
  return options.filter((o) => labels.includes(o.label)).map((o) => o.value);
}

export function valuesToLabels<T extends string>(
  options: EnumOption<T>[],
  values: T[],
): string[] {
  return options.filter((o) => values.includes(o.value)).map((o) => o.label);
}

export function labelForValue<T extends string>(
  options: EnumOption<T>[],
  value: T | undefined,
): string | undefined {
  return options.find((o) => o.value === value)?.label;
}
