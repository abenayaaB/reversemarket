import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-5xl font-extrabold text-brand-500">404</p>
        <p className="mt-2 text-slate-600">That page doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  )
}
