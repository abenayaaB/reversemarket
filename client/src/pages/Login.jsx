import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { dashboardPath } from '../utils/helpers'
import Logo from '../components/Logo'

export default function Login() {
  const { signIn, profile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Once the profile loads, send the user to the dashboard for their role.
  if (profile) return <Navigate to={dashboardPath(profile.role)} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signIn(form.email.trim(), form.password)
    } catch (err) {
      setError(err.message || 'Could not log in. Check your email and password.')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="card space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Log in
          </button>
          <p className="text-center text-sm text-slate-500">
            New here? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
