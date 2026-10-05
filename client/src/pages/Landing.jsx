import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  CheckCircle2,
  GitCompare,
  Inbox,
  ListChecks,
  PenLine,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react'

const STEPS = [
  { icon: PenLine, title: 'Post what you need', text: 'Set your category, budget, deadline and requirements in one simple brief.' },
  { icon: Inbox, title: 'Receive competing offers', text: 'Providers discover your requirement and submit their own price and proposal.' },
  { icon: GitCompare, title: 'Compare intelligently', text: 'See price, delivery and relevance signals together instead of comparing blindly.' },
  { icon: BadgeCheck, title: 'Choose with confidence', text: 'Shortlist the strongest offers and select the provider that fits best.' },
]

const FEATURES = [
  { icon: Target, title: 'Explainable matching', text: 'Every score is transparent: budget, delivery and relevance are shown separately.' },
  { icon: Scale, title: 'Side-by-side comparison', text: 'Compare competing offers without opening a dozen tabs or chats.' },
  { icon: BellRing, title: 'Live notifications', text: 'Stay updated when offers arrive, get shortlisted, or get selected.' },
  { icon: Wallet, title: 'Budget intelligence', text: 'Instantly see which providers fit inside your budget.' },
  { icon: CalendarClock, title: 'Deadline intelligence', text: 'Delivery timing is part of the match, not an afterthought.' },
  { icon: ShieldCheck, title: 'Controlled selection', text: 'Selecting one provider automatically closes the requirement and rejects competing offers.' },
]

export default function Landing() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="overflow-hidden bg-canvas">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#eef2ff] via-white to-violet-50">
        <div className="pointer-events-none absolute inset-0 landing-grid opacity-60" />
        <div className="pointer-events-none absolute left-[48%] top-24 hidden h-72 w-72 rounded-full border border-brand-200/30 [transform:perspective(700px)_rotateX(62deg)_rotateY(-8deg)] sm:block animate-orbit" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-24">
          <div className="relative z-10 animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles size={14} />
              The marketplace that works backwards
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Stop searching.
              <span className="block bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                Start receiving.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Tell ReverseMarket exactly what you need. Qualified providers compete for your requirement, while transparent matching helps you choose the strongest offer.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/register?role=customer" className="btn-primary !rounded-2xl !px-6 !py-3.5 text-base">
                Post a requirement <ArrowRight size={17} />
              </Link>
              <Link to="/register?role=provider" className="btn-ghost !rounded-2xl !px-6 !py-3.5 text-base">
                Become a provider
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time offer flow</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Explainable match scores</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Role-based workspace</span>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-violet-500/10 to-fuchsia-500/20 blur-3xl" />
            <div className="relative [perspective:1200px]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-2xl shadow-brand-900/15 backdrop-blur-xl transition-transform duration-500 hover:[transform:rotateY(-2deg)_rotateX(2deg)]">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">Live marketplace</p>
                      <p className="mt-1 text-lg font-black">Your requirement is getting offers</p>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"><GitCompare size={20} /></span>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-indigo-200">Customer requirement</p>
                        <p className="mt-1 text-sm font-bold">Budget · Deadline · Location</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">OPEN</span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <HeroOffer label="Match" value="Strong" tone="emerald" />
                    <HeroOffer label="Offers" value="Live" tone="violet" />
                    <HeroOffer label="Delivery" value="On time" tone="amber" />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-400 via-brand-400 to-fuchsia-400" />
                  </div>
                  <p className="mt-2 text-[10px] text-indigo-200/75">Budget + delivery + relevance · explainable matching</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2">
                  <MiniMetric label="Match" value="Explainable" />
                  <MiniMetric label="Offers" value="Competing" />
                  <MiniMetric label="Choice" value="Yours" />
                </div>
              </div>

              <div className="absolute -right-5 top-16 hidden w-44 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl shadow-brand-900/10 backdrop-blur-xl sm:block animate-float-slow">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={15} /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Offer activity</p>
                    <p className="text-xs font-extrabold text-slate-800">New provider response</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-5 bottom-20 hidden w-40 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl shadow-brand-900/10 backdrop-blur-xl sm:block animate-float-reverse">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600"><Sparkles size={15} /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Smart match</p>
                    <p className="text-xs font-extrabold text-slate-800">Why this offer?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="reveal-on-scroll mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">How it works</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">The flow is simple. The decision is smarter.</h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="card group relative overflow-hidden hover:-translate-y-1 hover:border-brand-200">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-50 blur-2xl transition group-hover:bg-violet-100" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/20">
                      <Icon size={21} />
                    </span>
                    <span className="text-4xl font-black text-slate-100">0{index + 1}</span>
                  </div>
                  <h3 className="mt-7 font-extrabold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section data-reveal id="features" className="reveal-on-scroll border-y border-slate-200/70 bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">Built for better decisions</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Everything important is visible before you choose.</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <ShieldCheck size={15} /> Transparent by design
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 font-extrabold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section data-reveal id="how" className="reveal-on-scroll mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950 p-8 shadow-2xl sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">Your decision, your rules</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">Turn a vague request into a competitive marketplace.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-indigo-100/80">Customers get choices. Providers get qualified opportunities. ReverseMarket connects both sides without forcing the customer to search provider by provider.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/register?role=customer" className="btn rounded-2xl bg-white text-brand-900 hover:bg-indigo-50">Start as a customer <ArrowRight size={16} /></Link>
                <Link to="/register?role=provider" className="btn rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/15">Join as a provider</Link>
              </div>
            </div>
            <div className="grid h-36 w-36 place-items-center rounded-[2rem] bg-white/10 ring-1 ring-white/15 animate-float">
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-2xl">
                <ListChecks size={40} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function HeroOffer({ label, value, tone }) {
  const toneClass = tone === 'emerald'
    ? 'bg-emerald-400/10 text-emerald-300'
    : tone === 'amber'
      ? 'bg-amber-400/10 text-amber-200'
      : 'bg-violet-400/10 text-violet-200'

  return (
    <div className={`rounded-xl px-3 py-3 ${toneClass}`}>
      <p className="text-[9px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-slate-700">{value}</p>
    </div>
  )
}
