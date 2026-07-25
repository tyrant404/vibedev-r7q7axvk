import { SnackTracker } from "@/components/snack-tracker";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14 md:px-8 md:pt-20">
      <header className="mb-10 md:mb-14">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
          What is still good?
        </h1>
        <p className="mt-4 max-w-[48ch] leading-relaxed text-muted">
          Log a snack with the day you bought it and how long it keeps. The most
          urgent ones sit on top.
        </p>
      </header>

      <SnackTracker />
    </main>
  );
}
