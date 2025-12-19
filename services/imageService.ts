import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BUCKET = "scarecrow-images";

// 1. Pick an image (camera or gallery)
export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
};

// 2. Upload image to Supabase Storage
export const uploadImageToSupabase = async (uri: string) => {
  try {
    // 1) Fetch user ID
    const supabaseUserId = await AsyncStorage.getItem("SUPABASE_USER_ID");
    if (!supabaseUserId) throw new Error("No Supabase user ID");

    // 2) Create unique filename
    const fileExt = uri.split(".").pop();
    const fileName = `${supabaseUserId}/${Date.now()}.${fileExt}`;

    // 3) Fetch blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // 4) Upload to bucket
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob);
    if (uploadError) throw uploadError;

    // 5) Save record in DB
    const { data: imageRecord, error: dbError } = await supabase
      .from("scarecrow_images")
      .insert({
        supabase_user_id: supabaseUserId,
        image_path: data.path
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return imageRecord;
  } catch (e) {
    console.error("Image upload failed:", e);
    return null;
  }
};

// 3. Get all images for current user
export const getImagesForUser = async () => {
  const supabaseUserId = await AsyncStorage.getItem("SUPABASE_USER_ID");
  if (!supabaseUserId) return [];

  const { data, error } = await supabase
    .from("scarecrow_images")
    .select("*")
    .eq("supabase_user_id", supabaseUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error);
    return [];
  }
  return data;
};

// 4. Get signed URL for display
export const getSignedUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24); // 24h
  return data.signedUrl;
};
