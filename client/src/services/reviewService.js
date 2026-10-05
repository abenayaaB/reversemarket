import { supabase } from '../lib/supabase'

export const REPUTATION_UPGRADE_MESSAGE =
  'The provider reputation upgrade is not enabled in Supabase yet. Run supabase/migrations/20261005_provider_reputation_and_locations.sql once, then refresh.'

function isMissingUpgrade(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('get_provider_reputation') ||
    message.includes('provider_reviews') ||
    message.includes('profiles.location') ||
    message.includes('column profiles.location does not exist')
  )
}

export async function getMyReviewForRequirement(requirementId, customerId) {
  const { data, error } = await supabase
    .from('provider_reviews')
    .select('*')
    .eq('requirement_id', requirementId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error) {
    if (isMissingUpgrade(error)) return null
    throw error
  }
  return data
}

export async function submitProviderReview({
  requirementId,
  offerId,
  customerId,
  providerId,
  rating,
  feedback,
}) {
  const safeRating = Number(rating)

  if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.')
  }

  if (!feedback?.trim()) {
    throw new Error('Please share a short feedback message.')
  }

  const { data, error } = await supabase
    .from('provider_reviews')
    .insert({
      requirement_id: requirementId,
      offer_id: offerId,
      customer_id: customerId,
      provider_id: providerId,
      rating: safeRating,
      feedback: feedback.trim(),
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getProviderReputations(providerIds = []) {
  const ids = Array.from(new Set(providerIds.filter(Boolean)))
  if (!ids.length) return {}

  const { data, error } = await supabase.rpc('get_provider_reputation', {
    provider_ids: ids,
  })

  if (error) {
    if (isMissingUpgrade(error)) {
      const upgradeError = new Error(REPUTATION_UPGRADE_MESSAGE)
      upgradeError.code = 'REPUTATION_UPGRADE_REQUIRED'
      throw upgradeError
    }
    throw error
  }

  return (data || []).reduce((result, row) => {
    result[row.provider_id] = {
      completedProjects: Number(row.completed_projects || 0),
      selectedProjects: Number(row.selected_projects || 0),
      successRate: Number(row.success_rate || 0),
      averageRating: Number(row.average_rating || 0),
      reviewCount: Number(row.review_count || 0),
    }
    return result
  }, {})
}

export async function getProviderReputation(providerId) {
  const reputations = await getProviderReputations([providerId])
  return reputations[providerId] || {
    completedProjects: 0,
    selectedProjects: 0,
    successRate: 0,
    averageRating: 0,
    reviewCount: 0,
  }
}

export async function getProviderReviews(providerId, limit = 8) {
  const { data, error } = await supabase
    .from('provider_reviews')
    .select('id, rating, feedback, created_at, requirement_id')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingUpgrade(error)) return []
    throw error
  }

  return data || []
}


export async function getMyReviewsForRequirements(requirementIds = [], customerId) {
  const ids = Array.from(new Set(requirementIds.filter(Boolean)))
  if (!ids.length || !customerId) return {}

  const { data, error } = await supabase
    .from('provider_reviews')
    .select('id, requirement_id, rating, feedback, created_at')
    .eq('customer_id', customerId)
    .in('requirement_id', ids)

  if (error) {
    if (isMissingUpgrade(error)) return {}
    throw error
  }

  return (data || []).reduce((result, item) => {
    result[item.requirement_id] = item
    return result
  }, {})
}
