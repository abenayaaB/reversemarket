import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Wallet,
  Send,
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { getOpenRequirement } from '../services/providerRequirementService'
import { createOffer, getMyOffer } from '../services/offerService'
import { formatINR, formatDate } from '../utils/helpers'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import LocationMap from '../components/LocationMap'

const EMPTY_FORM = {
  price: '',
  deliveryDate: '',
  message: '',
}

export default function ProviderRequirementDetails() {
  const { id } = useParams()
  const { profile } = useAuth()

  const [requirement, setRequirement] = useState(null)
  const [existingOffer, setExistingOffer] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!profile?.id) return

    const load = async () => {
      setLoading(true)
      setError('')
      setSuccess(false)

      try {
        const [requirementData, offerData] =
          await Promise.all([
            getOpenRequirement(id),
            getMyOffer(id, profile.id),
          ])

        setRequirement(requirementData)
        setExistingOffer(offerData)

        // If an offer already exists, show the success state
        // instead of showing the form again.
        if (offerData) {
          setSuccess(true)
          setForm(EMPTY_FORM)
        }
      } catch (e) {
        setError(
          e.message ||
            'Could not load this requirement.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, profile?.id])

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess(false)

    const price = Number(form.price)

    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid offer price.')
      return
    }

    if (!form.deliveryDate) {
      setError('Choose your delivery date.')
      return
    }

    if (!form.message.trim()) {
      setError('Write a short proposal message.')
      return
    }

    if (form.message.trim().length < 10) {
      setError(
        'Proposal message must be at least 10 characters.'
      )
      return
    }

    setSubmitting(true)

    try {
      const offer = await createOffer({
        requirementId: id,
        providerId: profile.id,
        price,
        deliveryDate: form.deliveryDate,
        message: form.message,
      })

      setExistingOffer(offer)

      // Clear the form
      setForm(EMPTY_FORM)

      // Show success screen
      setSuccess(true)
    } catch (e) {
      if (e.code === '23505') {
        setError(
          'You have already submitted an offer for this requirement.'
        )

        // If the offer already exists, show success state.
        const existing = await getMyOffer(
          id,
          profile.id
        )

        if (existing) {
          setExistingOffer(existing)
          setForm(EMPTY_FORM)
          setSuccess(true)
        }
      } else {
        setError(
          e.message ||
            'Could not submit your offer.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error && !requirement) {
    return <Alert>{error}</Alert>
  }

  if (!requirement) {
    return (
      <EmptyState
        title="Requirement not available"
        text="This requirement may have been closed or removed."
        actionLabel="Back to requirements"
        actionTo="/provider/requirements"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Back button */}
      <Link
        to="/provider/requirements"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Browse requirements
      </Link>

      {/* Error */}
      {error && <Alert>{error}</Alert>}

      {/* Requirement details */}
      <div className="card space-y-6">

        <div>
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {requirement.category}
          </span>

          <h1 className="mt-3 text-2xl font-extrabold text-brand-900">
            {requirement.title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Posted {formatDate(requirement.created_at)}
          </p>
        </div>

        {/* Requirement summary */}
        <div className="grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <Wallet
              className="text-brand-500"
              size={20}
            />

            <div>
              <p className="text-xs text-slate-400">
                Budget
              </p>

              <p className="font-semibold text-slate-900">
                {requirement.budget_min ===
                requirement.budget_max
                  ? formatINR(
                      requirement.budget_min
                    )
                  : `${formatINR(
                      requirement.budget_min
                    )} – ${formatINR(
                      requirement.budget_max
                    )}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays
              className="text-brand-500"
              size={20}
            />

            <div>
              <p className="text-xs text-slate-400">
                Deadline
              </p>

              <p className="font-semibold text-slate-900">
                {formatDate(
                  requirement.deadline
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin
              className="text-brand-500"
              size={20}
            />

            <div>
              <p className="text-xs text-slate-400">
                Location
              </p>

              <p className="font-semibold text-slate-900">
                {requirement.location}
              </p>
            </div>
          </div>

        </div>

        <LocationMap location={requirement.location} />

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500">
            What the customer needs
          </h2>

          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
            {requirement.description}
          </p>
        </div>

      </div>

      {/* Offer section */}
      <div className="card">

        {success ? (

          /* =========================
             SUCCESS STATE
             ========================= */
          <div className="flex flex-col items-center justify-center py-12 text-center">

            {/* Tick icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2
                size={46}
                className="text-green-600"
              />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
              Offer submitted successfully!
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your offer has been sent to the customer.
              You can track its status from your My Offers
              page.
            </p>

            {/* Buttons */}
            <div className="mt-7 flex flex-wrap justify-center gap-3">

              <Link
                to="/provider/offers"
                className="btn-primary"
              >
                View My Offers
              </Link>

              <Link
                to="/provider/requirements"
                className="btn-ghost"
              >
                Browse More Requirements
              </Link>

            </div>

          </div>

        ) : (

          /* =========================
             OFFER FORM
             ========================= */
          <>
            <div className="mb-5">

              <h2 className="text-xl font-bold text-slate-900">
                Submit your offer
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell the customer your price, delivery
                date and proposal.
              </p>

            </div>

            <form
              onSubmit={submit}
              className="space-y-5"
            >

              {/* Price + Delivery date */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="price"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Your price (₹)
                  </label>

                  <input
                    id="price"
                    type="number"
                    min="1"
                    step="any"
                    className="input"
                    placeholder="8500"
                    value={form.price}
                    onChange={update('price')}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="deliveryDate"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Delivery date
                  </label>

                  <input
                    id="deliveryDate"
                    type="date"
                    className="input"
                    value={form.deliveryDate}
                    onChange={update(
                      'deliveryDate'
                    )}
                    disabled={submitting}
                  />
                </div>

              </div>

              {/* Proposal */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Proposal message
                </label>

                <textarea
                  id="message"
                  rows={5}
                  className="input"
                  placeholder="Explain why you're a good fit, what you'll deliver and anything the customer should know."
                  value={form.message}
                  onChange={update('message')}
                  disabled={submitting}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full justify-center sm:w-auto"
                disabled={submitting}
              >

                {submitting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}

                {submitting
                  ? 'Submitting…'
                  : 'Submit offer'}

              </button>

            </form>
          </>
        )}

      </div>
    </div>
  )
}