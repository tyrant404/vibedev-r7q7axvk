export type Freshness = "fresh" | "aging" | "expired";

export type Snack = {
  id: string;
  name: string;
  purchasedOn: string;
  shelfLifeDays: number;
  addedAt: number;
};

export type SnackStatus = {
  freshness: Freshness;
  daysLeft: number;
  expiresOn: string;
};

export type SnackDraft = {
  name: string;
  purchasedOn: string;
  shelfLifeDays: string;
};

export type DraftErrors = Partial<Record<keyof SnackDraft, string>>;

const MS_PER_DAY = 86_400_000;
const STORAGE_KEY = "snack-shelf-life:v1";
const NAME_MAX = 60;
const SHELF_LIFE_MAX = 3650;
const AGING_FRACTION = 0.3;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDayNumber(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function fromDayNumber(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

export function statusOf(snack: Snack, today: string): SnackStatus {
  const expiryDay = toDayNumber(snack.purchasedOn) + snack.shelfLifeDays;
  const daysLeft = expiryDay - toDayNumber(today);
  const agingWindow = Math.max(1, Math.ceil(snack.shelfLifeDays * AGING_FRACTION));

  const freshness: Freshness =
    daysLeft < 0 ? "expired" : daysLeft <= agingWindow ? "aging" : "fresh";

  return { freshness, daysLeft, expiresOn: fromDayNumber(expiryDay) };
}

export function countdownLabel(daysLeft: number): string {
  if (daysLeft < 0) return `${-daysLeft}d over`;
  if (daysLeft === 0) return "last day";
  return `${daysLeft}d left`;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

function isValidCalendarDate(iso: string): boolean {
  if (!ISO_DATE.test(iso)) return false;
  return fromDayNumber(toDayNumber(iso)) === iso;
}

export function validateDraft(draft: SnackDraft, today: string): DraftErrors {
  const errors: DraftErrors = {};
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.name = "Give the snack a name.";
  } else if (name.length > NAME_MAX) {
    errors.name = `Keep it under ${NAME_MAX} characters.`;
  }

  if (!isValidCalendarDate(draft.purchasedOn)) {
    errors.purchasedOn = "Pick the date you bought it.";
  } else if (toDayNumber(draft.purchasedOn) > toDayNumber(today)) {
    errors.purchasedOn = "That date is in the future.";
  }

  const shelfLife = Number(draft.shelfLifeDays);
  if (draft.shelfLifeDays.trim().length === 0) {
    errors.shelfLifeDays = "How many days does it keep?";
  } else if (!Number.isInteger(shelfLife) || shelfLife < 1) {
    errors.shelfLifeDays = "Use a whole number of days, 1 or more.";
  } else if (shelfLife > SHELF_LIFE_MAX) {
    errors.shelfLifeDays = `${SHELF_LIFE_MAX} days is the ceiling.`;
  }

  return errors;
}

export function draftToSnack(draft: SnackDraft): Snack {
  return {
    id: crypto.randomUUID(),
    name: draft.name.trim(),
    purchasedOn: draft.purchasedOn,
    shelfLifeDays: Number(draft.shelfLifeDays),
    addedAt: Date.now(),
  };
}

function isSnack(value: unknown): value is Snack {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.purchasedOn === "string" &&
    isValidCalendarDate(candidate.purchasedOn) &&
    typeof candidate.shelfLifeDays === "number" &&
    Number.isInteger(candidate.shelfLifeDays) &&
    candidate.shelfLifeDays >= 1 &&
    typeof candidate.addedAt === "number"
  );
}

export function loadSnacks(): Snack[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSnack) : [];
  } catch {
    return [];
  }
}

export function saveSnacks(snacks: Snack[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snacks));
    return true;
  } catch {
    return false;
  }
}
