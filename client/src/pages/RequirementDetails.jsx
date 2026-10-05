import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Inbox,
  Info,
  Loader2,
  MapPin,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
  Wallet,
  Star,
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { getMyRequirement, deleteRequirement, updateRequirementStatus } from '../services/requirementService'
import { getOffersForRequirement, updateOfferStatus, closeRequirement } from '../services/offerService'
import { calculateMatchBreakdown, getMatchLabel } from '../utils/matchScore'
import { REQUIREMENT_STATUS } from '../utils/constants'
import { formatINR, formatDate } from '../utils/helpers'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import LocationMap from '../components/LocationMap'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import { getMyReviewForRequirement, submitProviderReview, getProviderReputations } from '../services/reviewService'

const Fact = ({ label, children }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1 font-semibold text-slate-900">{children}</dd>
  </div>
)

function scoreTone(score) {
  if (score >= 90) return 'from-emerald-500 to-teal-500'
  if (score >= 80) return 'from-brand-500 to-violet-500'
  if (score >= 70) return 'from-amber-400 to-orange-500'
  return 'from-slate-400 to-slate-500'
}

function OfferCard({ offer, requirement, onStatusChange, busy, reputation }) {
  const provider = offer.provider || {}
  const breakdown = calculateMatchBreakdown(offer, requirement)
  const score = breakdown.total
  const budgetFit = Number(offer.price) <= Number(requirement.budget_max)
  const deliveryFit = new Date(`${offer.delivery_date}T00:00:00`) <= new Date(`${requirement.deadline}T00:00:00`)

  return (
    <article className="group card relative overflow-hidden p-0 animate-fade-up hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
      <div className={`h-1.5 bg-gradient-to-r ${scoreTone(score)}`} />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-100 text-brand-600 ring-1 ring-brand-100">
              <UserRound size={21} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-extrabold text-slate-900">
                {provider.company_name || provider.full_name || 'Provider'}
              </h3>
              {provider.company_name && provider.full_name && (
                <p className="text-sm text-slate-500">{provider.full_name}</p>
              )}
            </div>
          </div>
          <StatusBadge
            status={offer.status}
            map={{
              submitted: { label: 'Submitted', style: 'bg-blue-50 text-blue-700' },
              shortlisted: { label: 'Shortlisted', style: 'bg-amber-50 text-amber-700' },
              selected: { label: 'Selected', style: 'bg-emerald-50 text-emerald-700' },
              rejected: { label: 'Rejected', style: 'bg-red-50 text-red-700' },
            }}
          />
        </div>

        {reputation && (
          <Link to={`/customer/providers/${provider.id}`} className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-white px-3 py-1.5 text-emerald-700">{reputation.successRate}% project success</span>
              <span className="rounded-full bg-white px-3 py-1.5 text-amber-700">★ {reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'}</span>
              <span className="text-slate-500">{reputation.completedProjects} completed</span>
            </div>
            <span className="text-xs font-bold text-brand-700 group-hover:translate-x-0.5 transition">View profile →</span>
          </Link>
        )}

        {provider.bio && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Provider profile</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{provider.bio}</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Wallet size={14} /> Provider price
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(offer.price)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CalendarDays size={14} /> Delivery
            </div>
            <p className="mt-2 text-lg font-extrabold text-slate-900">{formatDate(offer.delivery_date)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/90 to-violet-50/70 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-brand-600 shadow-sm"><Sparkles size={15} /></span>
                <div>
                  <p className="font-extrabold text-brand-950">{getMatchLabel(score)}</p>
                  <p className="text-xs text-brand-700">Transparent compatibility score</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-brand-700">{score}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-500">match</p>
            </div>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/90 shadow-inner">
            <div className={`h-full rounded-full bg-gradient-to-r ${scoreTone(score)} transition-all duration-700`} style={{ width: `${score}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ScoreMini label="Budget" score={breakdown.budgetScore} max={50} />
            <ScoreMini label="Delivery" score={breakdown.deliveryScore} max={30} />
            <ScoreMini label="Relevance" score={breakdown.relevanceScore} max={20} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Reason ok={budgetFit} text={budgetFit ? 'Within your budget' : 'Above your budget'} />
            <Reason ok={deliveryFit} text={deliveryFit ? 'Can meet the deadline' : 'Delivery is after the deadline'} />
          </div>

          <details className="mt-4 rounded-xl bg-white/70 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-slate-600">
              Why this score?
              <ChevronDown size={15} />
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Breakdown label="Company" value={`${breakdown.companyScore}/5`} />
              <Breakdown label="Provider bio" value={`${breakdown.bioScore}/7`} />
              <Breakdown label="Proposal" value={`${breakdown.offerScore}/8`} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
              <Info size={13} className="mt-0.5 shrink-0 text-brand-500" />
              The score combines budget fit, delivery timing and keyword relevance across the provider profile and proposal.
            </p>
          </details>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Provider proposal</p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{offer.message}</p>
        </div>

        {offer.status === 'selected' && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={20} /> This provider has been selected.
          </div>
        )}

        {offer.status === 'rejected' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            This offer was not selected.
          </div>
        )}

        {offer.status !== 'rejected' && offer.status !== 'selected' && requirement.status === 'open' && (
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              className={offer.status === 'shortlisted' ? 'btn bg-amber-500 text-white hover:bg-amber-600' : 'btn-primary'}
              disabled={busy}
              onClick={() => onStatusChange(offer, 'shortlisted')}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {offer.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              disabled={busy}
              onClick={() => onStatusChange(offer, 'selected')}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              <Check size={16} /> Select provider
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function ScoreMini({ label, score, max }) {
  return (
    <div className="rounded-xl bg-white/80 p-2.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{score}/{max}</p>
    </div>
  )
}

function Breakdown({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  )
}

function Reason({ ok, text }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${ok ? 'bg-emerald-100/70 text-emerald-700' : 'bg-red-100/70 text-red-700'}`}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80">{ok ? <Check size={12} /> : '!'}</span>
      {text}
    </div>
  )
}

export default function RequirementDetails() {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [req, setReq] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [offersLoading, setOffersLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingOffer, setUpdatingOffer] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('match')
  const [review, setReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [providerReputation, setProviderReputation] = useState({})

  const justCreated = location.state?.created

  useEffect(() => {
    if (!profile?.id) return
    const load = async () => {
      setLoading(true)
      setOffersLoading(true)
      setError('')
      try {
        const requirement = await getMyRequirement(id, profile.id)
        setReq(requirement)
        if (requirement) {
          const requirementOffers = await getOffersForRequirement(id)
          setOffers(requirementOffers)
          const providerIds = requirementOffers.map((offer) => offer.provider_id)
          const selectedOffer = requirementOffers.find((offer) => offer.status === 'selected')

          try {
            const reputation = providerIds.length ? await getProviderReputations(providerIds) : {}
            setProviderReputation(reputation)
          } catch (reputationError) {
            console.warn('Provider reputation is unavailable until the Supabase upgrade is applied.', reputationError)
            setProviderReputation({})
          }

          if (selectedOffer) {
            const existingReview = await getMyReviewForRequirement(id, profile.id)
            setReview(existingReview)
            if (existingReview) {
              setReviewRating(existingReview.rating)
              setReviewText(existingReview.feedback || '')
            }
          }
        } else setOffers([])
      } catch (e) {
        setError(e.message || 'Could not load this requirement.')
      } finally {
        setLoading(false)
        setOffersLoading(false)
      }
    }
    load()
  }, [id, profile?.id])

  const handleOfferStatusChange = async (offer, status) => {
    setUpdatingOffer(offer.id)
    setError('')
    try {
      if (status === 'selected') {
        await updateOfferStatus(offer.id, 'selected')
        const otherOffers = offers.filter((item) => item.id !== offer.id && item.status !== 'rejected')
        await Promise.all(otherOffers.map((item) => updateOfferStatus(item.id, 'rejected')))
        await closeRequirement(req.id)
        setReq((current) => current ? { ...current, status: 'closed' } : current)
        setOffers((current) => current.map((item) => ({ ...item, status: item.id === offer.id ? 'selected' : 'rejected' })))
      } else {
        const updated = await updateOfferStatus(offer.id, status)
        setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, status: updated.status } : item))
      }
    } catch (e) {
      setError(e.message || 'Could not update the offer.')
    } finally {
      setUpdatingOffer(null)
    }
  }

  const markCompleted = async () => {
    if (!profile?.id || req.status !== 'closed') return
    setCompleting(true)
    setError('')
    try {
      const updated = await updateRequirementStatus(req.id, profile.id, 'completed')
      setReq(updated)
      const selectedOffer = offers.find((offer) => offer.status === 'selected')
      if (selectedOffer) {
        try {
          const reputation = await getProviderReputations([selectedOffer.provider_id])
          setProviderReputation(reputation)
        } catch (reputationError) {
          console.warn(reputationError)
        }
      }
    } catch (e) {
      setError(e.message || 'Could not mark this requirement as completed.')
    } finally {
      setCompleting(false)
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    const selectedOffer = offers.find((offer) => offer.status === 'selected')
    if (!selectedOffer || req.status !== 'completed' || review) return
    setReviewing(true)
    setError('')
    try {
      const saved = await submitProviderReview({
        requirementId: req.id,
        offerId: selectedOffer.id,
        customerId: profile.id,
        providerId: selectedOffer.provider_id,
        rating: reviewRating,
        feedback: reviewText,
      })
      setReview(saved)
      try {
        const reputation = await getProviderReputations([selectedOffer.provider_id])
        setProviderReputation(reputation)
      } catch (reputationError) {
        console.warn(reputationError)
      }
    } catch (e) {
      if (e.code === '23505') setError('Feedback has already been submitted for this project.')
      else setError(e.message || 'Could not submit your feedback.')
    } finally {
      setReviewing(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    setError('')
    try {
      await deleteRequirement(id, profile.id)
      navigate('/customer/requirements', { replace: true })
    } catch (e) {
      setError(e.message || 'Could not delete this requirement.')
      setDeleting(false)
    }
  }

  const visibleOffers = useMemo(() => {
    const filtered = filter === 'all' ? [...offers] : offers.filter((offer) => offer.status === filter)
    return filtered.sort((a, b) => {
      if (sortBy === 'match') return calculateMatchBreakdown(b, req).total - calculateMatchBreakdown(a, req).total
      if (sortBy === 'price') return Number(a.price) - Number(b.price)
      if (sortBy === 'delivery') return new Date(a.delivery_date) - new Date(b.delivery_date)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [offers, req, filter, sortBy])

  if (loading) return <Spinner />
  if (error && !req) return <Alert>{error}</Alert>
  if (!req) return <EmptyState icon={SearchX} title="Requirement not found" text="It may have been deleted, or it doesn't belong to your account." actionLabel="Back to my requirements" actionTo="/customer/requirements" />

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <Link to="/customer/requirements" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-brand-700">
        <ArrowLeft size={16} /> My requirements
      </Link>

      {justCreated && <Alert type="success">Requirement posted. Providers can now see it.</Alert>}
      {error && <Alert>{error}</Alert>}

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{req.category}</span>
                <StatusBadge status={req.status} map={REQUIREMENT_STATUS} />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{req.title}</h1>
              <p className="mt-2 text-sm text-slate-500">Posted {formatDate(req.created_at)}</p>
            </div>
          </div>

          <dl className="mt-7 grid gap-3 border-y border-slate-100 py-5 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Budget">{formatINR(req.budget_min)}</Fact>
            <Fact label="Deadline">{formatDate(req.deadline)}</Fact>
            <Fact label="Location"><span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-brand-500" />{req.location || 'Not specified'}</span></Fact>
            <Fact label="Offers">{offers.length}</Fact>
          </dl>

          <LocationMap location={req.location} className="mt-6" />

          <div className="mt-6 max-w-4xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">What you need</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">{req.description}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">Provider competition</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Offers received</h2>
            <p className="mt-1 text-sm text-slate-500">Compare real offers using the same transparent score.</p>
          </div>
          <span className="w-fit rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700">{offers.length} offer{offers.length === 1 ? '' : 's'}</span>
        </div>

        {offersLoading ? <Spinner /> : offers.length === 0 ? (
          <EmptyState icon={Inbox} title="No offers yet" text="Providers will be able to submit offers for this requirement." />
        ) : (
          <>
            <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <SlidersHorizontal size={17} className="text-brand-500" />
                <span>Refine the offers</span>
                <span className="hidden text-xs font-normal text-slate-400 sm:inline">Choose what matters most to you.</span>
              </div>
              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort offers">
                <option value="match">Best match</option>
                <option value="price">Lowest price</option>
                <option value="delivery">Earliest delivery</option>
                <option value="newest">Newest offer</option>
              </select>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {[
                ['all', 'All'],
                ['submitted', 'Submitted'],
                ['shortlisted', 'Shortlisted'],
                ['selected', 'Selected'],
                ['rejected', 'Rejected'],
              ].map(([key, label]) => {
                const active = filter === key
                const count = key === 'all' ? offers.length : offers.filter((offer) => offer.status === key).length
                return (
                  <button key={key} type="button" onClick={() => setFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'}`}>
                    {label} <span className={active ? 'ml-1 text-indigo-100' : 'ml-1 text-slate-400'}>{count}</span>
                  </button>
                )
              })}
            </div>

            {visibleOffers.length === 0 ? (
              <EmptyState icon={Inbox} title="No offers in this view" text="Try another status filter." />
            ) : (
              <div className="space-y-5">
                {visibleOffers.length > 1 && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                      <div className="flex items-center gap-2"><GitCompareIcon /><h3 className="font-extrabold text-slate-900">Compare at a glance</h3></div>
                      <p className="mt-1 text-xs text-slate-500">Sorted by {sortBy === 'match' ? 'best match' : sortBy === 'price' ? 'lowest price' : sortBy === 'delivery' ? 'earliest delivery' : 'newest offer'}.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[760px] w-full text-left text-sm">
                        <thead className="bg-white text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          <tr>
                            <th className="px-5 py-3">Provider</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Match</th><th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {visibleOffers.map((offer) => {
                            const score = calculateMatchBreakdown(offer, req).total
                            const provider = offer.provider || {}
                            return (
                              <tr key={offer.id} className="transition hover:bg-slate-50">
                                <td className="px-5 py-4"><p className="font-bold text-slate-900">{provider.company_name || provider.full_name || 'Provider'}</p><p className="text-xs text-slate-400">{provider.full_name && provider.company_name ? provider.full_name : 'Service provider'}</p></td>
                                <td className="px-5 py-4 font-bold text-slate-900">{formatINR(offer.price)}</td>
                                <td className="px-5 py-4 text-slate-600">{formatDate(offer.delivery_date)}</td>
                                <td className="px-5 py-4"><span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{score}%</span></td>
                                <td className="px-5 py-4 capitalize text-slate-600">{offer.status}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {visibleOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} requirement={req} reputation={providerReputation[offer.provider_id]} onStatusChange={handleOfferStatusChange} busy={updatingOffer === offer.id} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {req.status === 'closed' && (
        <section className="card flex flex-wrap items-center justify-between gap-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-600" /><h2 className="font-extrabold text-slate-900">Provider selected</h2></div>
            <p className="mt-1 text-sm text-slate-500">Mark the requirement completed once the selected provider finishes the work.</p>
          </div>
          <button type="button" className="btn-primary" onClick={markCompleted} disabled={completing}>
            {completing && <Loader2 size={16} className="animate-spin" />}
            {completing ? 'Updating...' : 'Mark as completed'}
          </button>
        </section>
      )}

      {req.status === 'completed' && offers.some((offer) => offer.status === 'selected') && (
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 size={19} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Project completed</span></div>
                <h2 className="mt-2 text-2xl font-black text-slate-950">How was your experience?</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Your feedback helps future customers choose reliable providers and builds the provider's verified success profile.</p>
              </div>
              {(() => {
                const selectedOffer = offers.find((offer) => offer.status === 'selected')
                const rep = selectedOffer ? providerReputation[selectedOffer.provider_id] : null
                return rep ? (
                  <div className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Provider success</p>
                    <p className="mt-1 text-xl font-black text-emerald-700">{rep.successRate}%</p>
                  </div>
                ) : null
              })()}
            </div>

            {review ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-white/85 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">Your rating</span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                    <Star size={14} fill="currentColor" /> {review.rating}/5
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.feedback}</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="mt-6 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">Rate the provider</p>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Provider rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => setReviewRating(value)} aria-label={`${value} star${value > 1 ? 's' : ''}`} className={`grid h-11 w-11 place-items-center rounded-xl border transition ${reviewRating >= value ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300 hover:border-amber-200 hover:text-amber-400'}`}>
                        <Star size={19} fill={reviewRating >= value ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="provider-feedback">Your feedback</label>
                  <textarea id="provider-feedback" className="input" rows={4} maxLength={500} placeholder="Tell future customers what went well..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} disabled={reviewing} />
                  <p className="mt-1 text-right text-xs text-slate-400">{reviewText.length}/500</p>
                </div>
                <button type="submit" className="btn-primary" disabled={reviewing || !reviewText.trim()}>
                  {reviewing && <Loader2 size={16} className="animate-spin" />}
                  {reviewing ? 'Submitting...' : 'Submit feedback'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {offers.length === 0 && (
        <section className="card flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-bold text-slate-900">Delete this requirement</h2><p className="text-sm text-slate-500">Only possible while it has no offers. This can't be undone.</p></div>
          {confirming ? (
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setConfirming(false)} disabled={deleting}>Keep it</button>
              <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={remove} disabled={deleting}>{deleting && <Loader2 size={16} className="animate-spin" />} Yes, delete</button>
            </div>
          ) : (
            <button className="btn-ghost text-red-600" onClick={() => setConfirming(true)}><Trash2 size={16} /> Delete</button>
          )}
        </section>
      )}
    </div>
  )
}

function GitCompareIcon() {
  return <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-100 text-brand-600"><SlidersHorizontal size={15} /></span>
}
