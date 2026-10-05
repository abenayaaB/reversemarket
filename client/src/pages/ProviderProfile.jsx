import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2, MapPin, Star, Trophy, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getProviderReputation } from '../services/reviewService'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import LocationMap from '../components/LocationMap'

export default function ProviderProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [reputation, setReputation] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      setUpgradeRequired(false)
      try {
        let profileResult = await supabase
          .from('profiles')
          .select('id, full_name, company_name, bio, location, role, created_at')
          .eq('id', id)
          .eq('role', 'provider')
          .maybeSingle()

        if (profileResult.error) {
          const message = String(profileResult.error.message || '').toLowerCase()
          if (message.includes('profiles.location') || message.includes('column profiles.location')) {
            setUpgradeRequired(true)
            profileResult = await supabase
              .from('profiles')
              .select('id, full_name, company_name, bio, role, created_at')
              .eq('id', id)
              .eq('role', 'provider')
              .maybeSingle()
          }
        }

        if (profileResult.error) throw profileResult.error
        setProfile(profileResult.data)

        try {
          const rep = await getProviderReputation(id)
          setReputation(rep)
        } catch (reputationError) {
          console.warn(REPUTATION_UPGRADE_MESSAGE, reputationError)
          setUpgradeRequired(true)
          setReputation({
            successRate: 0,
            averageRating: 0,
            completedProjects: 0,
            selectedProjects: 0,
            reviewCount: 0,
          })
        }

        const reviewResult = await supabase
          .from('provider_reviews')
          .select('rating, feedback, created_at')
          .eq('provider_id', id)
          .order('created_at', { ascending: false })
          .limit(8)

        if (reviewResult.error) {
          const message = String(reviewResult.error.message || '').toLowerCase()
          if (message.includes('provider_reviews')) {
            setUpgradeRequired(true)
            setReviews([])
          } else {
            throw reviewResult.error
          }
        } else {
          setReviews(reviewResult.data || [])
        }
      } catch (e) {
        setError(e.message || 'Could not load provider profile.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (!profile) return <EmptyState icon={UserRound} title="Provider not found" text="This provider profile is no longer available." actionLabel="Back to map" actionTo="/customer/map" />

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/customer/map" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-700"><ArrowLeft size={16} /> Back to marketplace map</Link>

      {upgradeRequired && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Provider profile is visible, but verified reputation data will appear after the one-time Supabase upgrade is applied.
        </div>
      )}

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-brand-950 to-violet-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"><Building2 size={28} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Verified marketplace provider</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{profile.company_name || profile.full_name}</h1>
              {profile.company_name && <p className="mt-1 text-indigo-100/80">{profile.full_name}</p>}
              {profile.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-indigo-100/75"><MapPin size={14} /> {profile.location}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-200">Success</p><p className="mt-1 text-xl font-black">{reputation.successRate}%</p></div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-200">Rating</p><p className="mt-1 text-xl font-black">{reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'}</p></div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-200">Projects</p><p className="mt-1 text-xl font-black">{reputation.completedProjects}</p></div>
          </div>
        </div>
      </section>

      {profile.location && <LocationMap location={profile.location} />}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="card">
          <div className="flex items-center gap-2"><UserRound size={18} className="text-brand-600" /><h2 className="section-title">About this provider</h2></div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{profile.bio || 'This provider has not added a detailed service description yet.'}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Project success</p><p className="mt-1 text-2xl font-black text-emerald-800">{reputation.successRate}%</p><p className="mt-1 text-xs text-emerald-700">{reputation.completedProjects} completed</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Customer rating</p><p className="mt-1 flex items-center gap-1 text-2xl font-black text-amber-800"><Star size={20} fill="currentColor" /> {reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'}</p><p className="mt-1 text-xs text-amber-700">{reputation.reviewCount} review{reputation.reviewCount === 1 ? '' : 's'}</p></div>
            <div className="rounded-2xl bg-brand-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Selected projects</p><p className="mt-1 text-2xl font-black text-brand-800">{reputation.selectedProjects}</p><p className="mt-1 text-xs text-brand-700">Customer selections</p></div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2"><Trophy size={18} className="text-brand-600" /><h2 className="section-title">Why this profile matters</h2></div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span>Success rate is based on selected projects that were marked completed.</span></div>
            <div className="flex gap-3"><Star size={17} className="mt-0.5 shrink-0 text-amber-500" /><span>Ratings come directly from customers after completed work.</span></div>
            <div className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-brand-600" /><span>The service area is shown so customers can consider location before choosing.</span></div>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Customer voice</p><h2 className="mt-1 section-title">Recent feedback</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{reviews.length} shown</span></div>
        {reviews.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No customer feedback has been published yet.</p> : <div className="mt-5 grid gap-3 md:grid-cols-2">{reviews.map((review, index) => <article key={`${review.created_at}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-1 text-amber-500">{[1,2,3,4,5].map((star) => <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} />)}</div><span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.feedback}</p></article>)}</div>}
      </section>
    </div>
  )
}
