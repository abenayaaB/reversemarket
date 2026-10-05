import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dashboardPath } from '../utils/helpers'
import Spinner from './Spinner'

/** Blocks anonymous users, and users whose role doesn't match `role`. */
export default function ProtectedRoute({ role }) {
  const { session, profile, loading } = useAuth()
  if (loading || (session && !profile)) return <Spinner full />
  if (!session) return <Navigate to="/login" replace />
  if (role && profile.role !== role) return <Navigate to={dashboardPath(profile.role)} replace />
  return <Outlet />
}
