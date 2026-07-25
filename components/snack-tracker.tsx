"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WarningIcon } from "@phosphor-icons/react";
import { SnackForm } from "@/components/snack-form";
import { SnackList, type SnackRow } from "@/components/snack-list";
import {
  loadSnacks,
  saveSnacks,
  statusOf,
  todayIso,
  type Snack,
} from "@/lib/snacks";

const DAY_CHECK_INTERVAL = 30_000;

export function SnackTracker() {
  const [snacks, setSnacks] = useState<Snack[] | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    setSnacks(loadSnacks());
    setToday(todayIso());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setToday((previous) => {
        const next = todayIso();
        return previous === next ? previous : next;
      });
    }, DAY_CHECK_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  const addSnack = useCallback((snack: Snack) => {
    setSnacks((previous) => {
      const next = [...(previous ?? []), snack];
      setStorageFailed(!saveSnacks(next));
      return next;
    });
  }, []);

  const deleteSnack = useCallback((id: string) => {
    setSnacks((previous) => {
      const next = (previous ?? []).filter((snack) => snack.id !== id);
      setStorageFailed(!saveSnacks(next));
      return next;
    });
  }, []);

  const rows = useMemo<SnackRow[]>(() => {
    if (snacks === null || today === null) return [];
    return snacks
      .map((snack) => ({ snack, status: statusOf(snack, today) }))
      .sort(
        (a, b) =>
          a.status.daysLeft - b.status.daysLeft ||
          a.snack.name.localeCompare(b.snack.name),
      );
  }, [snacks, today]);

  const tally = useMemo(
    () => ({
      fresh: rows.filter((row) => row.status.freshness === "fresh").length,
      aging: rows.filter((row) => row.status.freshness === "aging").length,
      expired: rows.filter((row) => row.status.freshness === "expired").length,
    }),
    [rows],
  );

  if (snacks === null || today === null) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <SnackForm today={today} onAdd={addSnack} />

      {storageFailed ? (
        <p className="flex items-start gap-2 rounded-control border border-line bg-surface px-4 py-3 text-sm text-muted">
          <WarningIcon size={17} className="mt-0.5 shrink-0 text-aging" />
          This browser blocked local storage, so the list resets when you close
          the tab.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-panel border border-line bg-surface">
          <Tally value={tally.fresh} label="Fresh" tone="text-fresh" />
          <Tally value={tally.aging} label="Getting old" tone="text-aging" />
          <Tally value={tally.expired} label="Toss it" tone="text-expired" />
        </div>
      ) : null}

      <SnackList rows={rows} onDelete={deleteSnack} />
    </div>
  );
}

function Tally({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className={`font-mono text-2xl tabular-nums ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_8rem_auto]">
        <div className="h-[4.4rem] animate-pulse rounded-control bg-surface" />
        <div className="h-[4.4rem] animate-pulse rounded-control bg-surface" />
        <div className="h-[4.4rem] animate-pulse rounded-control bg-surface" />
        <div className="h-11 animate-pulse rounded-control bg-surface md:mt-[1.625rem] md:w-32" />
      </div>
      <div className="h-56 animate-pulse rounded-panel border border-line bg-surface" />
    </div>
  );
}
