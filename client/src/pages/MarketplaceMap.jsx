import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, MapPin, Search, Star, Settings2, Sparkles, } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { getOpenRequirements } from '../services/providerRequirementService'
import { getProviderReputations } from '../services/reviewService'
import { formatDate, formatINR } from '../utils/helpers'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import LocationMap from '../components/LocationMap'

export default function MarketplaceMap() {
  const { profile } = useAuth()
  const isCustomer = profile?.role === 'customer'
  const [items, setItems] = useState([])
  const [reputations, setReputations] = useState({})
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [reputationUnavailable, setReputationUnavailable] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    const load = async () => {
      setLoading(true)
      setError('')
      setUpgradeRequired(false)
      setReputationUnavailable(false)
      try {
        if (isCustomer) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, company_name, bio, location, role')
            .eq('role', 'provider')
            .not('location', 'is', null)
            .order('company_name', { ascending: true })

          if (profileError) {
            const message = String(profileError.message || '').toLowerCase()
            if (message.includes('profiles.location') || message.includes('column profiles.location')) {
              setUpgradeRequired(true)
              setItems([])
              setSelected(null)
              return
            }
            throw profileError
          }

          const providers = data || []
          try {
            const rep = await getProviderReputations(providers.map((p) => p.id))
            setReputations(rep)
          } catch (reputationError) {
            console.warn(reputationError)
            setReputations({})
            setReputationUnavailable(true)
          }
          setItems(providers)
          setSelected(providers[0] || null)
        } else {
          const requirements = await getOpenRequirements()
          setItems(requirements)
          setSelected(requirements[0] || null)
        }
      } catch (e) {
        setError(e.message || 'Could not load marketplace locations.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id, isCustomer])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const text = isCustomer
        ? [item.company_name, item.full_name, item.bio, item.location].join(' ')
        : [item.title, item.category, item.description, item.location].join(' ')
      return text.toLowerCase().includes(q)
    })
  }, [items, search, isCustomer])

  useEffect(() => {
    if (!selected || filtered.some((item) => item.id === selected.id)) return
    setSelected(filtered[0] || null)
  }, [filtered, selected])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-200"><MapPin size={16} /><span className="text-xs font-bold uppercase tracking-[0.18em]">Live marketplace map</span></div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{isCustomer ? 'Discover providers around you' : 'Discover nearby opportunities'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/80">
              {isCustomer ? 'Explore provider locations and reputation before choosing who to work with.' : 'Explore open customer requirements by location and find opportunities that fit your services.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-200">Available on map</p>
            <p className="mt-1 text-2xl font-black">{items.length}</p>
          </div>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}

      {upgradeRequired ? (
        <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200"><Settings2 size={21} /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">One-time setup</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Enable provider locations and reputation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Your existing marketplace data is safe. This page needs the one-time Supabase upgrade included with the project before provider locations can be displayed.</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <p className="text-sm font-bold text-slate-900">Run this file once in Supabase SQL Editor:</p>
              <code className="mt-2 block overflow-x-auto rounded-xl bg-slate-950 px-3 py-2 text-xs text-indigo-100">supabase/migrations/20261005_provider_reputation_and_locations.sql</code>
            </div>
            <p className="mt-3 text-xs text-slate-500">Then refresh this page and add a city/service area from Provider Profile. No private street address is required.</p>
          </div>
        </section>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={isCustomer ? 'No provider locations yet' : 'No open requirements yet'}
          text={isCustomer ? 'Providers who add a service location to their profile will appear here.' : 'Open customer requirements will appear on the marketplace map.'}
          actionLabel={isCustomer ? 'View profile' : 'Browse requirements'}
          actionTo={isCustomer ? '/customer/profile' : '/provider/requirements'}
        />
      ) : (
        <>
        {isCustomer && reputationUnavailable && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Sparkles size={18} className="mt-0.5 shrink-0" />
            <p>Provider locations are available, but verified ratings and success rates need the same one-time Supabase upgrade. The map remains usable.</p>
          </div>
        )}
        <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <section className="card !p-0 overflow-hidden">
            <div className="border-b border-slate-100 p-4">
              <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input !pl-10" placeholder={isCustomer ? 'Search providers...' : 'Search requirements...'} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-[610px] overflow-y-auto p-3">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No locations match your search.</div>
              ) : filtered.map((item) => {
                const active = selected?.id === item.id
                const rep = reputations[item.id]
                return (
                  <button key={item.id} type="button" onClick={() => setSelected(item)} className={`mb-2 w-full rounded-2xl border p-4 text-left transition-all duration-200 ${active ? 'border-brand-300 bg-brand-50 shadow-md shadow-brand-900/5' : 'border-slate-100 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{isCustomer ? <Building2 size={19} /> : <MapPin size={19} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold text-slate-900">{isCustomer ? (item.company_name || item.full_name) : item.title}</span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {item.location}</span>
                      </span>
                    </div>
                    {isCustomer ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{rep?.successRate ?? 0}% success</span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">★ {(rep?.averageRating || 0).toFixed(1)}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{item.category}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{formatINR(item.budget_max)}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-4">
            {selected && (
              <div className="card overflow-hidden !p-0">
                <LocationMap location={selected.location} className="!border-0 !shadow-none !rounded-none" />
                <div className="border-t border-slate-100 bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{isCustomer ? 'Provider location' : selected.category}</span>
                        {isCustomer && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{reputations[selected.id]?.successRate || 0}% success</span>}
                      </div>
                      <h2 className="mt-3 text-2xl font-black text-slate-950">{isCustomer ? (selected.company_name || selected.full_name) : selected.title}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {selected.location}</p>
                    </div>
                    {isCustomer ? (
                      <div className="flex items-center gap-1 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700"><Star size={16} fill="currentColor" /> {(reputations[selected.id]?.averageRating || 0).toFixed(1)} <span className="font-medium text-amber-600">({reputations[selected.id]?.reviewCount || 0})</span></div>
                    ) : (
                      <div className="rounded-2xl bg-brand-50 px-4 py-3 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">Budget</p><p className="mt-1 text-lg font-black text-brand-950">{formatINR(selected.budget_max)}</p></div>
                    )}
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {isCustomer ? (
                      <>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Completed projects</p><p className="mt-1 text-xl font-black text-slate-900">{reputations[selected.id]?.completedProjects || 0}</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Reviews</p><p className="mt-1 text-xl font-black text-slate-900">{reputations[selected.id]?.reviewCount || 0}</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Location</p><p className="mt-1 text-sm font-bold text-slate-900">Provider service area</p></div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Deadline</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900"><CalendarDays size={14} /> {formatDate(selected.deadline)}</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Opportunity</p><p className="mt-1 text-sm font-bold text-slate-900">Open for offers</p></div>
                        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Location</p><p className="mt-1 text-sm font-bold text-slate-900">Customer area</p></div>
                      </>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={isCustomer ? `/customer/providers/${selected.id}` : `/provider/requirements/${selected.id}`} className="btn-primary">{isCustomer ? 'View provider profile' : 'View requirement'} <ArrowRight size={16} /></Link>
                    {isCustomer && selected.bio && <p className="max-w-xl self-center text-sm leading-6 text-slate-500">{selected.bio}</p>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
        </>
      )}
    </div>
  )
}
