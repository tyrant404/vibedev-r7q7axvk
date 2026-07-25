"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BasketIcon, TrashIcon } from "@phosphor-icons/react";
import {
  countdownLabel,
  formatDate,
  type Freshness,
  type Snack,
  type SnackStatus,
} from "@/lib/snacks";

export type SnackRow = { snack: Snack; status: SnackStatus };

const STATUS: Record<Freshness, { rail: string; chip: string; label: string }> = {
  fresh: {
    rail: "bg-fresh",
    chip: "bg-fresh-soft text-fresh",
    label: "Fresh",
  },
  aging: {
    rail: "bg-aging",
    chip: "bg-aging-soft text-aging",
    label: "Getting old",
  },
  expired: {
    rail: "bg-expired",
    chip: "bg-expired-soft text-expired",
    label: "Toss it",
  },
};

export function SnackList({
  rows,
  onDelete,
}: {
  rows: SnackRow[];
  onDelete: (id: string) => void;
}) {
  const reduce = useReducedMotion();

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-panel border border-dashed border-line-strong px-6 py-16 text-center">
        <BasketIcon size={28} className="text-faint" />
        <p className="mt-4 font-medium">Nothing in the pantry yet</p>
        <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-muted">
          Add a snack above and it shows up here with a freshness read that
          updates on its own.
        </p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-panel border border-line bg-surface">
      <AnimatePresence initial={false}>
        {rows.map(({ snack, status }) => {
          const theme = STATUS[status.freshness];
          return (
            <motion.li
              key={snack.id}
              layout={reduce ? false : "position"}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 28 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line px-5 py-4 last:border-b-0"
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-[3px] ${theme.rail}`}
              />

              <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                <p className="truncate font-medium">{snack.name}</p>
                <p className="mt-1 font-mono text-xs text-faint">
                  Bought {formatDate(snack.purchasedOn)} · expires{" "}
                  {formatDate(status.expiresOn)}
                </p>
              </div>

              <span className="font-mono text-sm tabular-nums text-muted">
                {countdownLabel(status.daysLeft)}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${theme.chip}`}
              >
                {theme.label}
              </span>

              <button
                type="button"
                onClick={() => onDelete(snack.id)}
                aria-label={`Delete ${snack.name}`}
                className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-control text-faint transition-colors hover:bg-expired-soft hover:text-expired focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:ml-0"
              >
                <TrashIcon size={17} />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
