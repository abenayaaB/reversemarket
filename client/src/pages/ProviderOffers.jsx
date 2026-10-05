import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  RefreshCw,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'selected', label: 'Selected' },
  { key: 'rejected', label: 'Rejected' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusConfig(status) {
  switch (status) {
    case 'selected': return { label: 'Selected', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
    case 'shortlisted': return { label: 'Shortlisted', icon: Trophy, className: 'border-amber-200 bg-amber-50 text-amber-700' }
    case 'rejected': return { label: 'Rejected', icon: XCircle, className: 'border-red-200 bg-red-50 text-red-700' }
    default: return { label: 'Submitted', icon: Clock3, className: 'border-blue-200 bg-blue-50 text-blue-700' }
  }
}

export default function ProviderOffers() {
  const { profile } = useAuth()
  const [offers, setOffers] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadOffers = useCallback(async ({ silent = false } = {}) => {
    if (!profile?.id) return
    silent ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('offers')
        .select(`
          id,
          requirement_id,
          provider_id,
          price,
          delivery_date,
          message,
          status,
          created_at,
          updated_at,
          requirement:requirements!offers_requirement_id_fkey (
            id,
            title,
            category,
            location,
            deadline,
            budget_min,
            budget_max,
            status
          )
        `)
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setOffers(data || [])
    } catch (e) {
      setError(e.message || 'Could not load your offers.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile?.id])

  useEffect(() => { loadOffers() }, [loadOffers])

  useEffect(() => {
    const handleFocus = () => loadOffers({ silent: true })
    const handleVisibility = () => document.visibilityState === 'visible' && loadOffers({ silent: true })
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadOffers])

  const counts = useMemo(() => ({
    all: offers.length,
    submitted: offers.filter((o) => o.status === 'submitted').length,
    shortlisted: offers.filter((o) => o.status === 'shortlisted').length,
    selected: offers.filter((o) => o.status === 'selected').length,
    rejected: offers.filter((o) => o.status === 'rejected').length,
  }), [offers])

  const visibleOffers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const result = offers.filter((offer) => {
      const title = offer.requirement?.title || ''
      const category = offer.requirement?.category || ''
      const matchesSearch = !query || title.toLowerCase().includes(query) || category.toLowerCase().includes(query)
      const matchesStatus = filter === 'all' || offer.status === filter
      return matchesSearch && matchesStatus
    })

    return result.sort((a, b) => {
      if (sortBy === 'price') return Number(a.price) - Number(b.price)
      if (sortBy === 'delivery') return new Date(a.delivery_date) - new Date(b.delivery_date)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [offers, filter, sortBy, search])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-100">Provider workspace</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">My Offers</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/85">Track every proposal and see exactly when customers shortlist or select you.</p>
          </div>
          <button type="button" onClick={() => loadOffers({ silent: true })} disabled={refreshing} className="btn rounded-xl bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/20">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {filters.map((item) => {
          const active = filter === item.key
          return (
            <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`rounded-2xl border p-4 text-left transition-all duration-200 ${active ? 'border-brand-200 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${active ? 'text-brand-600' : 'text-slate-400'}`}>{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{counts[item.key]}</p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_190px_190px]">
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" placeholder="Search your offers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort offers">
          <option value="newest">Newest</option>
          <option value="price">Lowest price</option>
          <option value="delivery">Earliest delivery</option>
          <option value="status">Status</option>
        </select>
        <div className="flex items-center justify-center rounded-xl bg-slate-50 px-4 text-xs font-semibold text-slate-500">
          {visibleOffers.length} result{visibleOffers.length === 1 ? '' : 's'}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <RefreshCw size={24} className="mx-auto animate-spin text-brand-600" />
          <p className="mt-3 text-sm text-slate-500">Loading your offers...</p>
        </div>
      ) : visibleOffers.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><FileText size={26} /></div>
          <h2 className="mt-5 text-xl font-black text-slate-950">No offers found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{filter === 'all' ? 'Submit your first offer to start competing for customer requirements.' : `You do not have any ${filter} offers right now.`}</p>
          <Link to="/provider/requirements" className="btn-primary mt-6">Browse requirements <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOffers.map((offer) => {
            const status = getStatusConfig(offer.status)
            const StatusIcon = status.icon
            const requirement = offer.requirement
            return (
              <article key={offer.id} className="card overflow-hidden p-0 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}><StatusIcon size={13} />{status.label}</span>
                        {requirement?.category && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{requirement.category}</span>}
                      </div>
                      <h2 className="mt-4 text-xl font-black tracking-tight text-slate-950">{requirement?.title || 'Requirement'}</h2>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} className="text-brand-600" />Deadline: <span className="font-semibold text-slate-700">{formatDate(requirement?.deadline)}</span></span>
                        {requirement?.location && <span>{requirement.location}</span>}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 lg:min-w-[165px]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">Your offer</p>
                      <p className="mt-1 flex items-center text-2xl font-black text-brand-950"><IndianRupee size={18} className="text-brand-600" />{Number(offer.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-y border-slate-100 py-4 sm:grid-cols-2">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Delivery date</p><p className="mt-1 text-sm font-bold text-slate-700">{formatDate(offer.delivery_date)}</p></div>
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Submitted</p><p className="mt-1 text-sm font-bold text-slate-700">{new Date(offer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Your proposal</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{offer.message}</p>
                  </div>

                  {offer.status === 'selected' && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" /><div><p className="text-sm font-bold text-emerald-800">Your offer was selected!</p><p className="mt-1 text-sm text-emerald-700">The customer selected your proposal for this requirement.</p></div></div>}
                  {offer.status === 'shortlisted' && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><Trophy size={20} className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-sm font-bold text-amber-800">You have been shortlisted</p><p className="mt-1 text-sm text-amber-700">The customer is considering your offer.</p></div></div>}
                  {offer.status === 'rejected' && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"><XCircle size={20} className="mt-0.5 shrink-0 text-red-600" /><div><p className="text-sm font-bold text-red-800">Offer not selected</p><p className="mt-1 text-sm text-red-700">Another offer was selected for this requirement.</p></div></div>}

                  <div className="mt-5 flex justify-end">
                    <Link to={`/provider/requirements/${offer.requirement_id}`} className="btn-ghost !px-4 !py-2.5">View requirement <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
