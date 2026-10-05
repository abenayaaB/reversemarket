import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'

import StatusBadge from './StatusBadge'

import { REQUIREMENT_STATUS } from '../utils/constants'
import { formatINR, formatDate } from '../utils/helpers'
import { calculateMatchScore } from '../utils/matchScore'

export default function RequirementCard({
  requirement: r,
}) {
  const offers = r.offers ?? []

  const offerCount = offers.length

  const bestMatch =
    offers.length > 0
      ? Math.max(
          ...offers.map((offer) =>
            calculateMatchScore(
              offer,
              r
            )
          )
        )
      : null

  return (
    <Link
      to={`/customer/requirements/${r.id}`}
      className="card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-extrabold text-slate-900 transition group-hover:text-brand-700">
            {r.title}
          </h3>

          <p className="text-sm text-slate-500">
            {r.category} · {r.location}
          </p>
        </div>

        <StatusBadge
          status={r.status}
          map={REQUIREMENT_STATUS}
        />
      </div>

      {/* Details */}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">
            Budget
          </dt>

          <dd className="font-semibold">
            {formatINR(r.budget_max)}
          </dd>
        </div>

        <div>
          <dt className="text-slate-400">
            Deadline
          </dt>

          <dd className="font-semibold">
            {formatDate(r.deadline)}
          </dd>
        </div>

        <div>
          <dt className="text-slate-400">
            Offers
          </dt>

          <dd className="font-semibold">
            {offerCount}
          </dd>
        </div>

        <div>
          <dt className="text-slate-400">
            Best match
          </dt>

          <dd className="flex items-center gap-1 font-semibold">
            {bestMatch != null ? (
              <>
                <Target
                  size={14}
                  className="text-brand-500"
                />

                {bestMatch}%
              </>
            ) : (
              <span className="font-normal text-slate-400">
                No offers
              </span>
            )}
          </dd>
        </div>
      </dl>
    </Link>
  )
}