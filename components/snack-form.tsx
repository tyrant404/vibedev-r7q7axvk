"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import {
  draftToSnack,
  validateDraft,
  type DraftErrors,
  type Snack,
  type SnackDraft,
} from "@/lib/snacks";

const FIELD =
  "h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-text placeholder:text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const LABEL = "mb-2 block text-xs font-medium tracking-wide text-muted";
const ERROR = "mt-2 text-xs text-expired";

function emptyDraft(today: string): SnackDraft {
  return { name: "", purchasedOn: today, shelfLifeDays: "" };
}

export function SnackForm({
  today,
  onAdd,
}: {
  today: string;
  onAdd: (snack: Snack) => void;
}) {
  const [draft, setDraft] = useState<SnackDraft>(() => emptyDraft(today));
  const [errors, setErrors] = useState<DraftErrors>({});

  function update<K extends keyof SnackDraft>(key: K, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateDraft(draft, today);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    onAdd(draftToSnack(draft));
    setDraft(emptyDraft(today));
    setErrors({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_8rem_auto] md:items-start"
    >
      <div>
        <label className={LABEL} htmlFor="snack-name">
          Snack
        </label>
        <input
          id="snack-name"
          className={FIELD}
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Salted caramel granola bars"
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "snack-name-error" : undefined}
        />
        {errors.name ? (
          <p id="snack-name-error" className={ERROR}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className={LABEL} htmlFor="snack-date">
          Bought on
        </label>
        <input
          id="snack-date"
          type="date"
          max={today}
          className={FIELD}
          value={draft.purchasedOn}
          onChange={(event) => update("purchasedOn", event.target.value)}
          aria-invalid={errors.purchasedOn ? true : undefined}
          aria-describedby={errors.purchasedOn ? "snack-date-error" : undefined}
        />
        {errors.purchasedOn ? (
          <p id="snack-date-error" className={ERROR}>
            {errors.purchasedOn}
          </p>
        ) : null}
      </div>

      <div>
        <label className={LABEL} htmlFor="snack-life">
          Keeps for
        </label>
        <div className="relative">
          <input
            id="snack-life"
            type="number"
            inputMode="numeric"
            min={1}
            max={3650}
            className={`${FIELD} pr-12 font-mono tabular-nums`}
            value={draft.shelfLifeDays}
            onChange={(event) => update("shelfLifeDays", event.target.value)}
            placeholder="30"
            aria-invalid={errors.shelfLifeDays ? true : undefined}
            aria-describedby={
              errors.shelfLifeDays ? "snack-life-error" : "snack-life-hint"
            }
          />
          <span
            id="snack-life-hint"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-faint"
          >
            days
          </span>
        </div>
        {errors.shelfLifeDays ? (
          <p id="snack-life-error" className={ERROR}>
            {errors.shelfLifeDays}
          </p>
        ) : null}
      </div>

      <div className="md:pt-[1.625rem]">
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-control bg-ink px-5 text-sm font-medium text-ink-contrast transition-transform duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:w-auto"
        >
          <PlusIcon size={16} weight="bold" />
          Add snack
        </button>
      </div>
    </form>
  );
}
