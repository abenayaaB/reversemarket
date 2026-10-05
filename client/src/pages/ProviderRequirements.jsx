import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, CalendarDays, Wallet, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOpenRequirements } from '../services/providerRequirementService'
import { formatINR, formatDate } from '../utils/helpers'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'

export default function ProviderRequirements() {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const loadRequirements = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getOpenRequirements()
      setRequirements(data)
    } catch (e) {
      setError(e.message || 'Could not load requirements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequirements()
  }, [])

  const categories = useMemo(() => {
    return [...new Set(requirements.map((r) => r.category).filter(Boolean))]
      .sort()
  }, [requirements])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return requirements.filter((r) => {
      const matchesSearch =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)

      const matchesCategory =
        category === 'all' || r.category === category

      return matchesSearch && matchesCategory
    })
  }, [requirements, search, category])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-900">
            Browse requirements
          </h1>
          <p className="text-slate-500">
            Find customer requirements that match your services.
          </p>
        </div>

        <button
          onClick={loadRequirements}
          className="btn-ghost"
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="card grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className="input pl-10"
            placeholder="Search requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching requirements"
          text={
            requirements.length === 0
              ? 'There are no open customer requirements right now.'
              : 'Try changing your search or category filter.'
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((requirement) => (
            <article key={requirement.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {requirement.category}
                  </span>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    {requirement.title}
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Open
                </span>
              </div>

              <p className="line-clamp-3 text-sm text-slate-600">
                {requirement.description}
              </p>

              <div className="grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Wallet size={16} className="text-slate-400" />
                  {requirement.budget_min === requirement.budget_max
                    ? formatINR(requirement.budget_min)
                    : `${formatINR(requirement.budget_min)} – ${formatINR(requirement.budget_max)}`}
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays size={16} className="text-slate-400" />
                  {formatDate(requirement.deadline)}
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  {requirement.location}
                </div>
              </div>

              <Link
                to={`/provider/requirements/${requirement.id}`}
                className="btn-primary w-full justify-center"
              >
                View requirement
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}