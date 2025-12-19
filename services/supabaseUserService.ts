import { supabase } from '../lib/supabase';

export const getOrCreateSupabaseUser = async (restUser: any) => {

  const externalId = restUser.id_number;

  // 1. Check if user exists
  const { data: existingUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('external_id', externalId)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // 2. Create user if not exists
  const { data: newUser, error } = await supabase
    .from('app_users')
    .insert({
      external_id: externalId,
      email: restUser.email,
      full_name: `${restUser.first_name} ${restUser.last_name}`,
    })
    .select()
    .single();

  if (error) throw error;

  return newUser;
};
