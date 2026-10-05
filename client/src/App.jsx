import { Route, Routes } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderRequirementDetails from './pages/ProviderRequirementDetails'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

import CustomerDashboard from './pages/CustomerDashboard'
import CreateRequirement from './pages/CreateRequirement'
import MyRequirements from './pages/MyRequirements'
import RequirementDetails from './pages/RequirementDetails'

import ProviderDashboard from './pages/ProviderDashboard'
import ProviderRequirements from './pages/ProviderRequirements'

import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

import Shortlist from './pages/Shortlist'
import ProviderOffers from './pages/ProviderOffers'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import MarketplaceMap from './pages/MarketplaceMap'
import ProviderProfile from './pages/ProviderProfile'

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ==================== CUSTOMER ==================== */}
      <Route element={<ProtectedRoute role="customer" />}>
        <Route element={<AppLayout />}>
          <Route
            path="/customer/dashboard"
            element={<CustomerDashboard />}
          />

          <Route
            path="/customer/requirements"
            element={<MyRequirements />}
          />

          <Route
            path="/customer/requirements/new"
            element={<CreateRequirement />}
          />

          <Route
            path="/customer/requirements/:id"
            element={<RequirementDetails />}
          />

          <Route path="/customer/shortlist" element={<Shortlist />} />
          <Route path="/customer/notifications" element={<Notifications />} />
          <Route path="/customer/map" element={<MarketplaceMap />} />
          <Route path="/customer/providers/:id" element={<ProviderProfile />} />
          <Route path="/customer/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ==================== PROVIDER ==================== */}
      <Route element={<ProtectedRoute role="provider" />}>
        <Route element={<AppLayout />}>
          <Route
            path="/provider/dashboard"
            element={<ProviderDashboard />}
          />

          <Route
            path="/provider/requirements/:id"
            element={<ProviderRequirementDetails />}
          />

          <Route
            path="/provider/requirements"
            element={<ProviderRequirements />}
          />

          <Route path="/provider/offers" element={<ProviderOffers />} />
          <Route path="/provider/notifications" element={<Notifications />} />
          <Route path="/provider/map" element={<MarketplaceMap />} />
          <Route path="/provider/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}