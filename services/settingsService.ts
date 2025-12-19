import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';

const SETTINGS_TABLE = 'scarecrow_settings';

export interface AlertSound {
  id: string;
  name: string;
  uri?: string;
  isCustom: boolean;
}

export interface UserSettings {
  volumeLevel: number;
  selectedSoundId: string;
  alertSounds: AlertSound[];
  geoEnabled: boolean;
  connectedDevices: string[];
  anchorLocation: Location.LocationObject | null;
}

// Get settings from Supabase for current user
export const getSettings = async (): Promise<UserSettings | null> => {
  const supabaseUserId = await AsyncStorage.getItem('SUPABASE_USER_ID');

  if (!supabaseUserId) {
    throw new Error('Supabase user ID not found');
  }

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('supabase_user_id', supabaseUserId)
    .single();

  if (error && error.code !== 'PGRST116') { // no rows found is not an error
    throw error;
  }

  return data ? (data as UserSettings) : null;
};

// Save settings to Supabase
export const saveSettings = async (settings: UserSettings) => {
  const supabaseUserId = await AsyncStorage.getItem('SUPABASE_USER_ID');

  if (!supabaseUserId) {
    throw new Error('Supabase user ID not found');
  }

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert({
      supabase_user_id: supabaseUserId,
      ...settings,
      updated_at: new Date(),
    })
    .select()
    .single();

  if (error) throw error;

  return data as UserSettings;
};
