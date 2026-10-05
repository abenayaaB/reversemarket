import { supabase } from '../lib/supabase'

export async function getProviderStats(providerId) {
  const [
    { count: available, error: e1 },
    { data: offers, error: e2 },
  ] = await Promise.all([
    supabase
      .from('requirements')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),

    supabase
      .from('offers')
      .select('id, status')
      .eq('provider_id', providerId),
  ])

  if (e1 || e2) {
    throw e1 || e2
  }

  const by = (status) =>
    (offers || []).filter((offer) => offer.status === status).length

  return {
    available: available || 0,
    myOffers: offers?.length || 0,
    shortlisted: by('shortlisted'),
    selected: by('selected'),
  }
}