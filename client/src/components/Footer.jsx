import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-indigo-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-300">
            Instead of searching for what's available, tell us what you need and let the right providers come to you.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">For customers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-white">Post a requirement</Link></li>
            <li><a href="#how" className="hover:text-white">How it works</a></li>
            <li><a href="#features" className="hover:text-white">Smart matching</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">For providers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register?role=provider" className="hover:text-white">Become a provider</Link></li>
            <li><Link to="/login" className="hover:text-white">Provider login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-indigo-300">
        © {new Date().getFullYear()} ReverseMarket. Built for the hackathon.
      </div>
    </footer>
  )
}
