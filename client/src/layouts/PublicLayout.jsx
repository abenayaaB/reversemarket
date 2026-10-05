import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar publicMode />
      <div className="flex-1"><Outlet /></div>
      <Footer />
    </div>
  )
}
