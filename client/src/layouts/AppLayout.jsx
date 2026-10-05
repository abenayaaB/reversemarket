import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 overflow-hidden md:ml-72">
        <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-brand-100/35 blur-3xl" />
      </div>
      <main className="relative min-h-screen px-4 pb-10 pt-20 sm:px-6 md:ml-72 md:px-8 md:pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
