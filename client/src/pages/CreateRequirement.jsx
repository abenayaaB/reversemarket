import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { createRequirement } from '../services/requirementService'
import { validateRequirement, tomorrowISO } from '../utils/validators'
import { CATEGORIES } from '../utils/constants'
import FormField from '../components/FormField'
import Alert from '../components/Alert'

const EMPTY = { title: '', category: '', description: '', budget: '', deadline: '', location: '', preferences: '' }

export default function CreateRequirement() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  const update = (key) => (e) => {
    const next = { ...form, [key]: e.target.value }
    setForm(next)
    if (submitted) setErrors(validateRequirement(next)) // re-check live once the user has tried to submit
  }
  const cls = (k) => `input ${errors[k] ? '!border-red-400 focus:!ring-red-100' : ''}`
  const aria = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-error` : undefined })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError('')
    const found = validateRequirement(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      const { id } = await createRequirement(profile.id, form)
      navigate(`/customer/requirements/${id}`, { state: { created: true } })
    } catch (err) {
      setServerError(err.message || 'Could not save your requirement. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/customer/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <h1 className="text-2xl font-extrabold text-brand-900">Post a requirement</h1>
      <p className="mb-6 text-slate-500">The more specific you are, the better the offers you'll get.</p>

      <form onSubmit={submit} noValidate className="card space-y-5">
        {serverError && <Alert>{serverError}</Alert>}
        {submitted && Object.keys(errors).length > 0 && <Alert>Fix the highlighted fields and try again.</Alert>}

        <FormField id="title" label="Title" required error={errors.title}>
          <input id="title" className={cls('title')} placeholder="e.g. College event photography" maxLength={120}
            value={form.title} onChange={update('title')} {...aria('title')} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="category" label="Category" required error={errors.category}>
            <select id="category" className={cls('category')} value={form.category} onChange={update('category')} {...aria('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField id="location" label="Location" required error={errors.location}>
            <input id="location" className={cls('location')} placeholder="e.g. Chennai"
              value={form.location} onChange={update('location')} {...aria('location')} />
          </FormField>
        </div>

        <FormField id="description" label="Description" required error={errors.description}>
          <textarea id="description" rows={5} className={cls('description')}
            placeholder="What do you need done? Include scope, size and anything a provider should know."
            value={form.description} onChange={update('description')} {...aria('description')} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="budget" label="Budget (₹)" required error={errors.budget}>
            <input id="budget" type="number" inputMode="decimal" min="1" step="any" className={cls('budget')}
              placeholder="10000" value={form.budget} onChange={update('budget')} {...aria('budget')} />
          </FormField>
          <FormField id="deadline" label="Deadline" required error={errors.deadline}>
            <input id="deadline" type="date" min={tomorrowISO()} className={cls('deadline')}
              value={form.deadline} onChange={update('deadline')} {...aria('deadline')} />
          </FormField>
        </div>

        <FormField id="preferences" label="Additional preferences" hint="Optional. Style, tools, experience, anything that matters to you.">
          <textarea id="preferences" rows={3} className="input" value={form.preferences} onChange={update('preferences')} />
        </FormField>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link to="/customer/dashboard" className="btn-ghost">Cancel</Link>
          <button className="btn-primary" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} {busy ? 'Posting…' : 'Post requirement'}
          </button>
        </div>
      </form>
    </div>
  )
}
