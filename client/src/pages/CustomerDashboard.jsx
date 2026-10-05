import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  FileText,
  Inbox,
  ListChecks,
  CheckCircle2,
  Star,
  ArrowRight,
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { getMyRequirements } from '../services/requirementService'
import { getOffersForRequirements } from '../services/offerService'
import { getMyReviewsForRequirements } from '../services/reviewService'

import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import RequirementCard from '../components/RequirementCard'
import CardSkeletons from '../components/CardSkeletons'
import Alert from '../components/Alert'

const RECENT = 4

export default function CustomerDashboard() {
  const { profile } = useAuth()

  const [reqs, setReqs] = useState([])
  const [offers, setOffers] = useState([])
  const [reviews, setReviews] = useState({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.id) return

    const loadDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const requirements = await getMyRequirements(profile.id)

        setReqs(requirements)

        if (requirements.length === 0) {
          setOffers([])
          return
        }

        const requirementIds = requirements.map((requirement) => requirement.id)
        const allOffers = await getOffersForRequirements(requirementIds)

        try {
          setReviews(await getMyReviewsForRequirements(
            requirements.filter((requirement) => requirement.status === 'completed').map((requirement) => requirement.id),
            profile.id,
          ))
        } catch {
          setReviews({})
        }

        const offersByRequirement = allOffers.reduce((groups, offer) => {
          if (!groups[offer.requirement_id]) groups[offer.requirement_id] = []
          groups[offer.requirement_id].push(offer)
          return groups
        }, {})

        setReqs(requirements.map((requirement) => ({
          ...requirement,
          offers: offersByRequirement[requirement.id] || [],
        })))
        setOffers(allOffers)
      } catch (e) {
        setError(
          e.message || 'Could not load your dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [profile?.id])

  const stats = {
    active: reqs.filter(
      (r) => r.status === 'open'
    ).length,

    offers: offers.length,

    shortlisted: offers.filter(
      (o) => o.status === 'shortlisted'
    ).length,

    completed: reqs.filter(
      (r) => r.status === 'completed'
    ).length,
  }

  return (
    <div className="space-y-8">

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-200">Customer workspace</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Hi, {profile?.full_name?.split(' ')[0]} 👋</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80">Post a requirement, let providers compete, then choose using transparent matching instead of guesswork.</p>
          </div>
          <Link to="/customer/requirements/new" className="btn rounded-xl bg-white text-brand-900 hover:bg-indigo-50"><Plus size={16} /> Post requirement</Link>
        </div>
      </section>

      {/* Error */}
      {error && (
        <Alert>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={FileText}
          label="Active requirements"
          value={stats.active}
          loading={loading}
        />

        <StatCard
          icon={Inbox}
          label="Offers received"
          value={stats.offers}
          loading={loading}
        />

        <StatCard
          icon={ListChecks}
          label="Shortlisted offers"
          value={stats.shortlisted}
          loading={loading}
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          loading={loading}
        />

      </div>

      {!loading && reqs.some((requirement) =>
        requirement.status === 'completed' &&
        offers.some((offer) => offer.requirement_id === requirement.id && offer.status === 'selected') &&
        !reviews[requirement.id]
      ) && (
        <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm sm:p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-amber-700">
              <Star size={17} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">Feedback pending</span>
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-950">Your completed project is ready for a review</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">A quick rating and honest note helps future customers choose reliable providers.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {reqs
                .filter((requirement) =>
                  requirement.status === 'completed' &&
                  offers.some((offer) => offer.requirement_id === requirement.id && offer.status === 'selected') &&
                  !reviews[requirement.id]
                )
                .slice(0, 2)
                .map((requirement) => (
                  <Link key={requirement.id} to={`/customer/requirements/${requirement.id}`} className="btn bg-amber-500 text-white hover:bg-amber-600">
                    Review {requirement.title.length > 28 ? `${requirement.title.slice(0, 28)}…` : requirement.title}
                    <ArrowRight size={15} />
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirements */}
      <section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            My requirements
          </h2>

          {reqs.length > RECENT && (
            <Link
              to="/customer/requirements"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all {reqs.length}
            </Link>
          )}
        </div>

        {loading ? (
          <CardSkeletons />
        ) : reqs.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requirements yet"
            text="Create your first requirement and start receiving offers."
            actionLabel="Post requirement"
            actionTo="/customer/requirements/new"
          />
        ) : (
          <div className="grid gap-4">
            {reqs
              .slice(0, RECENT)
              .map((r) => (
                <RequirementCard
                  key={r.id}
                  requirement={r}
                />
              ))}
          </div>
        )}

      </section>
    </div>
  )
}