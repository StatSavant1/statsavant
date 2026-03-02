// app/edge/page.tsx
import Link from "next/link";

const BRAND = "StatSavant";

const PRIMARY_CTA_LABEL = "Start Free (Create Account)";
const PRIMARY_CTA_HREF = "/signup";

const SECONDARY_CTA_LABEL = "View Pricing";
const SECONDARY_CTA_HREF = "/pricing";

const SUBSCRIBE_CTA_LABEL = "Subscribe";
const SUBSCRIBE_CTA_HREF = "/subscribe";

const APP_LINKS = [
  { label: "View NBA Props", href: "/nba" },
  { label: "View NHL Props", href: "/nhl" },
];

export default function EdgeLandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            No picks. No hype. Just data.
          </p>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            See which player props are trending{" "}
            <span className="text-emerald-400">before you bet</span>.
          </h1>

          <p className="mt-5 text-pretty text-base text-white/70 sm:text-lg">
            Instantly compare last 10 or last 5 games vs today’s lines across{" "}
            <span className="text-white/90">NBA & NHL</span>. Stop betting blind
            — check the trend in seconds.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={PRIMARY_CTA_HREF}
              className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-center text-base font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:w-auto"
            >
              {PRIMARY_CTA_LABEL}
            </Link>

            <Link
              href={SECONDARY_CTA_HREF}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-center text-base font-semibold text-white/90 transition hover:bg-white/10 sm:w-auto"
            >
              {SECONDARY_CTA_LABEL}
            </Link>

            <Link
              href={SUBSCRIBE_CTA_HREF}
              className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-center text-base font-semibold text-emerald-200 transition hover:bg-emerald-500/15 sm:w-auto"
            >
              {SUBSCRIBE_CTA_LABEL}
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/50">
            Create a free account to explore trends. Upgrade anytime for full
            access.
          </p>

          <div className="mt-4 text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Log in
            </Link>
          </div>
        </header>

        <section className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          <FeatureCard
            title="Trend-Based Edge"
            text="See L10/L5 averages vs the line and how often a player clears it — instantly."
          />
          <FeatureCard
            title="Built for Serious Bettors"
            text="Made to reduce guesswork. Clean, fast, and focused on decision support."
          />
          <FeatureCard
            title="One Platform, Multiple Sports"
            text="NBA + NHL player props in one place. No spreadsheets. No tab overload."
          />
        </section>

        <section className="mx-auto mt-14 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            How it works
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Step
              num="1"
              title="Pick a sport + market"
              text="Points, rebounds, assists, threes, shots on goal, and more."
            />
            <Step
              num="2"
              title="Compare trends vs today’s line"
              text="Quickly see what’s been clearing and what’s been dead lately."
            />
            <Step
              num="3"
              title="Build smarter slips"
              text="Use the data to narrow your card before you place bets."
            />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={PRIMARY_CTA_HREF}
              className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-center text-base font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:w-auto"
            >
              {PRIMARY_CTA_LABEL}
            </Link>

            <Link
              href={SUBSCRIBE_CTA_HREF}
              className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-center text-base font-semibold text-emerald-200 transition hover:bg-emerald-500/15 sm:w-auto"
            >
              {SUBSCRIBE_CTA_LABEL}
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-white/45">
            Most users start free to explore before upgrading.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-5xl text-center">
          <p className="text-sm text-white/50">
            Quick links (if your pages allow viewing):
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {APP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <footer className="mx-auto mt-14 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {BRAND}. Data helps — nothing is
          guaranteed.
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-emerald-400">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

function Step({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
        {num}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </div>
  );
}