import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('YOUR_') &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase not configured properly. Image uploads will not work.\n' +
    'To enable image uploads:\n' +
    '1. Go to your Supabase dashboard: https://supabase.com/dashboard\n' +
    '2. Select your project\n' +
    '3. Go to Settings > API\n' +
    '4. Copy the "anon public" key\n' +
    '5. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n' +
    '6. Also create a "job-images" bucket in Storage with public access'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Storage bucket name for job images
export const JOB_IMAGES_BUCKET = 'job-images';

// Helper to get public URL for an image
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(JOB_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to upload an image
export async function uploadJobImage(
  file: File,
  jobId: string
): Promise<{ url: string; path: string } | { error: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `jobs/${jobId}/${fileName}`;

  const { error } = await supabase.storage
    .from(JOB_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  return {
    url: getPublicUrl(filePath),
    path: filePath,
  };
}

// Helper to delete an image
export async function deleteJobImage(path: string): Promise<{ error?: string }> {
  const { error } = await supabase.storage
    .from(JOB_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return {};
}
