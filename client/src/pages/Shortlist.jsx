import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  MessageSquare,
  Star,
  UserRound,
} from 'lucide-react'

import { AuthContext } from '../context/AuthContext'
import { getProviderReputations } from '../services/reviewService'
import {
  getMyRequirements,
} from '../services/requirementService'
import {
  getOffersForRequirement,
} from '../services/offerService'
import {
  calculateMatchBreakdown,
  getMatchLabel,
} from '../utils/matchScore'

function formatDate(date) {
  if (!date) return 'Not specified'

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function MatchScore({ breakdown }) {
  const {
    total,
    budgetScore,
    deliveryScore,
    relevanceScore,
  } = breakdown

  const label = getMatchLabel(total)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Match Score
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {total}%
            </span>

            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {label}
            </span>
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
          <Star
            size={20}
            className="fill-emerald-500 text-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <ScoreRow
          label="Budget"
          score={budgetScore}
          max={50}
        />

        <ScoreRow
          label="Delivery"
          score={deliveryScore}
          max={30}
        />

        <ScoreRow
          label="Relevance"
          score={relevanceScore}
          max={20}
        />
      </div>
    </div>
  )
}

function ScoreRow({ label, score, max }) {
  const percentage = max > 0
    ? Math.min(100, (score / max) * 100)
    : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">
          {label}
        </span>

        <span className="font-semibold text-slate-800">
          {score}/{max}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function OfferCard({ offer, requirement, reputation }) {
  const breakdown = calculateMatchBreakdown(
    offer,
    requirement
  )

  const provider =
    offer.provider || {}

  const providerName =
    provider.company_name ||
    provider.full_name ||
    'Provider'

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

        {/* LEFT */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <UserRound
                  size={22}
                  className="text-slate-600"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {providerName}
                </h3>

                {provider.full_name &&
                  provider.company_name && (
                    <p className="mt-0.5 text-sm text-slate-500">
                      {provider.full_name}
                    </p>
                  )}
              </div>
            </div>

            {reputation && (
              <Link to={`/customer/providers/${provider.id}`} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 transition hover:border-emerald-200">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700">{reputation.successRate}% success</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700">★ {reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'}</span>
                <span className="text-xs font-semibold text-slate-500">{reputation.completedProjects} completed</span>
                <span className="ml-auto text-xs font-bold text-brand-700">View profile →</span>
              </Link>
            )}

            {offer.status === 'shortlisted' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <CheckCircle2 size={14} />
                Shortlisted
              </span>
            )}

            {offer.status === 'selected' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Selected
              </span>
            )}
          </div>

          {/* Provider Bio */}
          {provider.bio && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <UserRound
                  size={15}
                  className="text-slate-500"
                />

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Provider Info
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {provider.bio}
              </p>
            </div>
          )}

          {/* Offer Details */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <IndianRupee size={14} />
                Offer Price
              </div>

              <p className="text-xl font-bold text-slate-900">
                ₹{Number(offer.price).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Clock3 size={14} />
                Delivery
              </div>

              <p className="font-semibold text-slate-900">
                {formatDate(offer.delivery_date)}
              </p>
            </div>
          </div>

          {/* Offer Proposal */}
          <div className="mt-4 rounded-2xl border border-slate-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare
                size={15}
                className="text-slate-500"
              />

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Provider Proposal
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-700">
              {offer.message || 'No proposal message provided.'}
            </p>
          </div>

          {/* Match Explanation */}
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">
                Why this matches
              </span>

              <span className="text-sm font-bold text-emerald-700">
                {breakdown.total}%
              </span>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div className="rounded-xl bg-white p-3">
                <p className="text-slate-400">
                  Company Info
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {breakdown.companyScore}/5
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-slate-400">
                  Provider Bio
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {breakdown.bioScore}/7
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-slate-400">
                  Offer Proposal
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {breakdown.offerScore}/8
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <MatchScore
            breakdown={breakdown}
          />

          <Link
            to={`/customer/requirements/${requirement.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Requirement
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Shortlist() {
  const { profile } = useContext(AuthContext)

  const [requirements, setRequirements] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reputations, setReputations] = useState({})

  useEffect(() => {
    if (!profile?.id) return

    const loadShortlist = async () => {
      setLoading(true)
      setError('')

      try {
        const myRequirements =
          await getMyRequirements(profile.id)

        const offerGroups = await Promise.all(
          myRequirements.map(async (requirement) => {
            const requirementOffers =
              await getOffersForRequirement(
                requirement.id
              )

            return requirementOffers.map((offer) => ({
              ...offer,
              requirement,
            }))
          })
        )

        const allOffers =
          offerGroups.flat()

        // Only show shortlisted or selected offers
        // on the Shortlist page.
        const shortlistedOffers =
          allOffers.filter(
            (offer) =>
              offer.status === 'shortlisted' ||
              offer.status === 'selected'
          )

        try {
          setReputations(await getProviderReputations(shortlistedOffers.map((offer) => offer.provider_id)))
        } catch {
          setReputations({})
        }

        // Highest match score first.
        shortlistedOffers.sort(
          (a, b) =>
            calculateMatchBreakdown(
              b,
              b.requirement
            ).total -
            calculateMatchBreakdown(
              a,
              a.requirement
            ).total
        )

        setRequirements(myRequirements)
        setOffers(shortlistedOffers)
      } catch (err) {
        console.error(err)

        setError(
          err.message ||
            'Could not load shortlisted offers.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadShortlist()
  }, [profile?.id])

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/customer/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                ReverseMarket
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Your Shortlist
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Compare the providers you shortlisted using
                budget, delivery time and relevance to your
                requirement.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Shortlisted Offers
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {offers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

            <p className="text-sm text-slate-500">
              Loading your shortlisted offers...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          offers.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Star
                  size={24}
                  className="text-slate-400"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Nothing shortlisted yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Open one of your requirements, compare the
                provider offers and shortlist the ones that
                look promising.
              </p>

              <Link
                to="/customer/requirements"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View My Requirements
              </Link>
            </div>
          )}

        {/* Offers */}
        {!loading &&
          !error &&
          offers.length > 0 && (
            <div className="space-y-5">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  requirement={offer.requirement}
                  reputation={reputations[offer.provider_id]}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  )
}