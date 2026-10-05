import { supabase } from '../lib/supabase'

export async function getOpenRequirements() {
  const { data, error } = await supabase
    .from('requirements')
    .select(`
      id,
      title,
      description,
      category,
      budget_min,
      budget_max,
      deadline,
      location,
      status,
      created_at
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export async function getOpenRequirement(id) {
  const { data, error } = await supabase
    .from('requirements')
    .select(`
      id,
      title,
      description,
      category,
      budget_min,
      budget_max,
      deadline,
      location,
      status,
      created_at
    `)
    .eq('id', id)
    .eq('status', 'open')
    .maybeSingle()

  if (error) throw error

  return data
}