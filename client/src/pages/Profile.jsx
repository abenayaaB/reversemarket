import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, MapPin, Star, Trophy, UserRound } from 'lucide-react'
import { getProviderReputation, getProviderReviews } from '../services/reviewService'

import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { profile, updateProfile } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    bio: '',
    location: '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reputation, setReputation] = useState(null)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (!profile) return

    setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      company_name: profile.company_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
    })
  }, [profile])

  useEffect(() => {
    if (profile?.role !== 'provider') return
    Promise.all([getProviderReputation(profile.id), getProviderReviews(profile.id, 6)])
      .then(([rep, items]) => { setReputation(rep); setReviews(items) })
      .catch(() => { setReputation(null); setReviews([]) })
  }, [profile?.id, profile?.role])

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }))
    setError('')
    setSuccess('')
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!form.full_name.trim()) {
      setError('Enter your full name.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile(form)
      setSuccess('Profile updated successfully.')
    } catch (e) {
      setError(e.message || 'Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null

  const isProvider = profile.role === 'provider'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-brand-900">
          My Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Keep your information up to date so other users know who they are
          working with.
        </p>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <UserRound size={26} className="text-brand-600" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {profile.full_name}
            </h2>

            <p className="text-sm text-slate-500">
              {profile.role === 'provider' ? 'Provider account' : 'Customer account'}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {isProvider && reputation && (
          <div className="mb-6 grid gap-3 border-b border-slate-100 pb-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><div className="flex items-center gap-2 text-emerald-700"><Trophy size={16} /><span className="text-xs font-bold uppercase tracking-wide">Success rate</span></div><p className="mt-2 text-2xl font-black text-emerald-800">{reputation.successRate}%</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><div className="flex items-center gap-2 text-amber-700"><Star size={16} fill="currentColor" /><span className="text-xs font-bold uppercase tracking-wide">Rating</span></div><p className="mt-2 text-2xl font-black text-amber-800">{reputation.averageRating ? reputation.averageRating.toFixed(1) : '—'}</p></div>
            <div className="rounded-2xl bg-brand-50 p-4"><div className="flex items-center gap-2 text-brand-700"><CheckCircle2 size={16} /><span className="text-xs font-bold uppercase tracking-wide">Completed</span></div><p className="mt-2 text-2xl font-black text-brand-800">{reputation.completedProjects}</p></div>
          </div>
        )}

        {isProvider && reputation && (
          <section className="mb-6 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Customer trust</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Your verified track record</h3>
              </div>
              <p className="text-xs text-slate-400">{reputation.reviewCount} customer review{reputation.reviewCount === 1 ? '' : 's'}</p>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-4 space-y-3">
                {reviews.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill={star <= item.rating ? 'currentColor' : 'none'} />)}
                      </div>
                      <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.feedback}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Customer feedback will appear here after completed projects are reviewed.</p>
            )}
          </section>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label" htmlFor="profile-name">
              Full name
            </label>

            <input
              id="profile-name"
              className="input"
              value={form.full_name}
              onChange={update('full_name')}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="profile-phone">
              Phone
            </label>

            <input
              id="profile-phone"
              type="tel"
              className="input"
              placeholder="Optional"
              value={form.phone}
              onChange={update('phone')}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="profile-company">
              {isProvider ? 'Business / provider name' : 'Organisation / company'}
            </label>

            <input
              id="profile-company"
              className="input"
              placeholder={isProvider ? 'Your business name' : 'Optional'}
              value={form.company_name}
              onChange={update('company_name')}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="profile-location">Service location</label>
            <div className="relative">
              <MapPin size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="profile-location" className="input !pl-10" placeholder="e.g. Chennai, Tamil Nadu" value={form.location} onChange={update('location')} disabled={saving} />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Used on the marketplace map. Keep it to a city or service area rather than a private address.</p>
          </div>

          <div>
            <label className="label" htmlFor="profile-bio">
              {isProvider ? 'About your services' : 'About you'}
            </label>

            <textarea
              id="profile-bio"
              rows={5}
              className="input"
              placeholder={
                isProvider
                  ? 'Describe your experience, services and strengths.'
                  : 'Add a short introduction.'
              }
              value={form.bio}
              onChange={update('bio')}
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
