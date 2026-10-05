import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Compass,
  MapPin,
  RefreshCw,
  Send,
  Trophy,
  Wallet,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { getProviderStats } from '../services/dashboardService'
import { getOpenRequirements } from '../services/providerRequirementService'
import { formatDate, formatINR } from '../utils/helpers'
import { getProviderReputation, getProviderReviews } from '../services/reviewService'

import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'

export default function ProviderDashboard() {
  const { profile } = useAuth()

  const [stats, setStats] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reputation, setReputation] = useState(null)
  const [reviews, setReviews] = useState([])

  const load = async () => {
    if (!profile?.id) return

    setLoading(true)
    setError('')

    try {
      const [providerStats, openRequirements] =
        await Promise.all([
          getProviderStats(profile.id),
          getOpenRequirements(),
        ])

      setStats(providerStats)
      setRequirements(openRequirements)

      try {
        const providerReputation = await getProviderReputation(profile.id)
        const providerReviews = await getProviderReviews(profile.id, 3)
        setReputation(providerReputation)
        setReviews(providerReviews)
      } catch (reputationError) {
        console.warn('Provider reputation is unavailable until the Supabase upgrade is applied.', reputationError)
        setReputation(null)
        setReviews([])
      }
    } catch (e) {
      setError(e.message || 'Could not load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [profile?.id])

  const recommended = useMemo(() => {
    return [...requirements]
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 3)
  }, [requirements])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-100">Provider workspace</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{profile?.company_name || profile?.full_name}</h1>
            <p className="mt-2 text-sm text-indigo-100/85">Find live customer requirements and turn the right opportunity into your next offer.</p>
          </div>
          <button type="button" onClick={load} disabled={loading} className="btn rounded-xl bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/20"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </div>
      </section>
      {error && <Alert>{error}</Alert>}

      {reputation && (
        <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Verified performance</span>
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <Star size={12} className="mr-1 inline" fill="currentColor" /> {reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'} rating
                </span>
              </div>
              <h2 className="mt-3 text-xl font-black text-slate-950">Your provider reputation</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Customers see these verified signals when comparing your offers. Keep delivering well to build a stronger profile.</p>
              {reviews.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= reviews[0].rating ? 'currentColor' : 'none'} />)}
                    <span className="ml-2 text-xs font-semibold text-slate-400">Latest customer feedback</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">“{reviews[0].feedback}”</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[390px]">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Success</p><p className="mt-1 text-2xl font-black text-emerald-800">{reputation.successRate}%</p></div>
              <div className="rounded-2xl bg-brand-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Completed</p><p className="mt-1 text-2xl font-black text-brand-800">{reputation.completedProjects}</p></div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Reviews</p><p className="mt-1 text-2xl font-black text-amber-800">{reputation.reviewCount}</p></div>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Compass}
          label="Available requirements"
          value={stats?.available}
          loading={loading}
        />

        <StatCard
          icon={Send}
          label="My offers"
          value={stats?.myOffers}
          loading={loading}
        />

        <StatCard
          icon={Trophy}
          label="Shortlisted"
          value={stats?.shortlisted}
          loading={loading}
        />

        <StatCard
          icon={Trophy}
          label="Selected"
          value={stats?.selected}
          loading={loading}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended requirements
            </h2>

            <p className="text-sm text-slate-500">
              Fresh customer requirements are shown here so you can quickly find opportunities.
            </p>
          </div>

          <Link
            to="/provider/requirements"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : recommended.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No open requirements yet"
            text="New customer requirements will appear here."
            actionLabel="Browse requirements"
            actionTo="/provider/requirements"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {recommended.map((requirement) => (
              <article
                key={requirement.id}
                className="card flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {requirement.category}
                  </span>

                </div>

                <h3 className="mt-4 line-clamp-2 font-bold text-slate-900">
                  {requirement.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {requirement.description}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Wallet size={15} className="text-slate-400" />
                    {formatINR(requirement.budget_max)}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-slate-400" />
                    {formatDate(requirement.deadline)}
                  </div>

                  {requirement.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-slate-400" />
                      {requirement.location}
                    </div>
                  )}
                </div>

                <Link
                  to={`/provider/requirements/${requirement.id}`}
                  className="btn-primary mt-5 w-full justify-center"
                >
                  View requirement
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
