import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Inbox, SearchX } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { getMyRequirements } from '../services/requirementService'
import { getOffersForRequirements } from '../services/offerService'
import { CATEGORIES, REQUIREMENT_STATUS } from '../utils/constants'

import RequirementCard from '../components/RequirementCard'
import CardSkeletons from '../components/CardSkeletons'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'

export default function MyRequirements() {
  const { profile } = useAuth()

  const [reqs, setReqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!profile?.id) return

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const requirements = await getMyRequirements(profile.id)

        const offers = await getOffersForRequirements(
          requirements.map((requirement) => requirement.id)
        )

        const offersByRequirement = offers.reduce((groups, offer) => {
          if (!groups[offer.requirement_id]) groups[offer.requirement_id] = []
          groups[offer.requirement_id].push(offer)
          return groups
        }, {})

        setReqs(requirements.map((requirement) => ({
          ...requirement,
          offers: offersByRequirement[requirement.id] || [],
        })))
      } catch (e) {
        setError(
          e.message || 'Could not load your requirements.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [profile?.id])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()

    return reqs.filter((r) =>
      (!term ||
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)) &&
      (!status || r.status === status) &&
      (!category || r.category === category)
    )
  }, [reqs, q, status, category])

  const filtering = q || status || category

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">
            My requirements
          </h1>

          <p className="text-slate-500">
            Everything you've posted, in one place.
          </p>
        </div>

        <Link
          to="/customer/requirements/new"
          className="btn-primary"
        >
          <Plus size={16} />
          Post requirement
        </Link>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <CardSkeletons count={3} />
      ) : reqs.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requirements yet"
          text="Create your first requirement and start receiving offers."
          actionLabel="Post requirement"
          actionTo="/customer/requirements/new"
        />
      ) : (
        <>
          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                aria-label="Search requirements"
                className="input !pl-10"
                placeholder="Search by title or description"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select
              aria-label="Filter by status"
              className="input sm:w-48"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>

              {Object.entries(REQUIREMENT_STATUS).map(
                ([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                )
              )}
            </select>

            <select
              aria-label="Filter by category"
              className="input sm:w-48"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="">All categories</option>

              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching requirements"
              text="Try a different search or clear the filters."
            />
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {filtering
                  ? `${filtered.length} of ${reqs.length}`
                  : reqs.length}{' '}
                requirement
                {reqs.length === 1 ? '' : 's'}
              </p>

              <div className="grid gap-4">
                {filtered.map((r) => (
                  <RequirementCard
                    key={r.id}
                    requirement={r}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}