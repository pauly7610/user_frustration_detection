import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_KEY: z.string(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url()
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.errors);
    throw new Error('Invalid environment configuration');
  }

  return result.data;
};

export const env = validateEnv(); 