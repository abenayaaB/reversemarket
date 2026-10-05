import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Loader2, ShoppingBag, Briefcase } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { dashboardPath } from '../utils/helpers'
import Logo from '../components/Logo'

function RoleButton({ active, onClick, icon: Icon, title, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border p-4 text-left transition ${
        active
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <Icon
        size={20}
        className={
          active
            ? 'text-brand-600'
            : 'text-slate-400'
        }
      />

      <p className="mt-2 text-sm font-bold text-slate-900">
        {title}
      </p>

      <p className="text-xs text-slate-500">
        {text}
      </p>
    </button>
  )
}

export default function Register() {
  const { signUp, profile } = useAuth()
  const [params] = useSearchParams()

  const [role, setRole] = useState(
    params.get('role') === 'provider'
      ? 'provider'
      : 'customer'
  )

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
    bio: '',
  })

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (profile) {
    return (
      <Navigate
        to={dashboardPath(profile.role)}
        replace
      />
    )
  }

  const set = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }))
  }

  const validate = () => {
    if (!form.full_name.trim()) {
      return 'Enter your full name.'
    }

    if (!form.email.trim()) {
      return 'Enter your email.'
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.'
    }

    if (
      role === 'provider' &&
      !form.company_name.trim()
    ) {
      return 'Enter your business or provider name.'
    }

    if (
      role === 'provider' &&
      !form.bio.trim()
    ) {
      return 'Add a short description of what you offer.'
    }

    return ''
  }

  const submit = async (event) => {
    event.preventDefault()

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setNotice('')
    setBusy(true)

    try {
      const meta = {
        full_name: form.full_name.trim(),
        role,
      }

      if (role === 'provider') {
        meta.company_name =
          form.company_name.trim()

        meta.bio = form.bio.trim()
      }

      const data = await signUp({
        email: form.email.trim(),
        password: form.password,
        ...meta,
      })

      if (!data.session) {
        setNotice(
          'Account created. Confirm your email, then log in.'
        )
        setBusy(false)
      }
    } catch (err) {
      setError(
        err.message ||
          'Could not create account.'
      )
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-canvas px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <form
          onSubmit={submit}
          className="card space-y-4"
        >
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Choose how you want to use ReverseMarket.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
            >
              {notice}
            </p>
          )}

          <div className="flex gap-3">
            <RoleButton
              active={role === 'customer'}
              onClick={() =>
                setRole('customer')
              }
              icon={ShoppingBag}
              title="Customer"
              text="I need something done"
            />

            <RoleButton
              active={role === 'provider'}
              onClick={() =>
                setRole('provider')
              }
              icon={Briefcase}
              title="Provider"
              text="I offer a service"
            />
          </div>

          <div>
            <label
              className="label"
              htmlFor="full_name"
            >
              Full name
            </label>

            <input
              id="full_name"
              className="input"
              value={form.full_name}
              onChange={set('full_name')}
              disabled={busy}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="label"
                htmlFor="email"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                className="input"
                value={form.email}
                onChange={set('email')}
                disabled={busy}
              />
            </div>

            <div>
              <label
                className="label"
                htmlFor="password"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input"
                value={form.password}
                onChange={set('password')}
                disabled={busy}
              />
            </div>
          </div>

          {role === 'provider' && (
            <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
              <div>
                <label
                  className="label"
                  htmlFor="company_name"
                >
                  Business / provider name
                </label>

                <input
                  id="company_name"
                  className="input"
                  placeholder="e.g. Lens & Light Studio"
                  value={form.company_name}
                  onChange={set('company_name')}
                  disabled={busy}
                />
              </div>

              <div>
                <label
                  className="label"
                  htmlFor="bio"
                >
                  About your services
                </label>

                <textarea
                  id="bio"
                  rows={4}
                  className="input"
                  placeholder="Describe your experience, services and strengths."
                  value={form.bio}
                  onChange={set('bio')}
                  disabled={busy}
                />
              </div>
            </div>
          )}

          <button
            className="btn-primary w-full"
            disabled={busy}
          >
            {busy && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {busy
              ? 'Creating account...'
              : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
