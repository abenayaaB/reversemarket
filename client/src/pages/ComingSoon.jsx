import { Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { dashboardPath } from '../utils/helpers'

// Placeholder so nav links resolve until the phase that builds the page.
export default function ComingSoon({ phase }) {
  const { profile } = useAuth()
  return (
    <div className="card mx-auto mt-10 flex max-w-md flex-col items-center py-12 text-center">
      <Hammer className="mb-3 text-brand-500" />
      <h1 className="text-lg font-bold">Built in {phase}</h1>
      <p className="mt-1 text-sm text-slate-500">This page isn't implemented yet.</p>
      <Link to={dashboardPath(profile?.role)} className="btn-ghost mt-5">Back to dashboard</Link>
    </div>
  )
}
