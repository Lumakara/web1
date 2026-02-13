-- ============================================
-- SUPABASE SECURITY FIXES
-- ============================================
-- This file contains SQL fixes for the security lint issues
-- identified in the Supabase Advisor dashboard

-- ============================================
-- 1. FIX: Function Search Path Mutable
-- Entity: public.handle_new_user
-- ============================================
-- Issue: Function has a role mutable search_path
-- Fix: Set search_path to an empty string to prevent search path injection attacks

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- Fixed: Explicitly set search_path
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. FIX: Function Search Path Mutable
-- Entity: public.handle_updated_at
-- ============================================
-- Issue: Function has a role mutable search_path
-- Fix: Set search_path to an empty string

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- Fixed: Explicitly set search_path
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. FIX: RLS Policy Always True
-- Entity: public.support_tickets
-- Policy: "Users can create tickets"
-- ============================================
-- Issue: INSERT policy with WITH CHECK (true) allows unrestricted access
-- Fix: Restrict INSERT to authenticated users only

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;

-- Create a new, more restrictive policy
CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can only create tickets for themselves
  user_id = auth.uid()
  OR 
  -- Allow anonymous tickets (optional - remove if not needed)
  user_id IS NULL
);

-- Alternative: If you want to allow anyone to create tickets (including anonymous)
-- but still want some validation, use this instead:
-- CREATE POLICY "Users can create tickets"
-- ON public.support_tickets
-- FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (
--   -- Ensure email is provided for anonymous tickets
--   (user_id IS NULL AND email IS NOT NULL)
--   OR 
--   -- Authenticated users must match their own ID
--   (user_id = auth.uid())
-- );

-- ============================================
-- 4. ENABLE LEAKED PASSWORD PROTECTION
-- ============================================
-- Issue: Leaked password protection is disabled
-- Fix: This needs to be enabled in the Supabase Dashboard
-- Go to: Project Settings > Authentication > Security & Protection
-- Enable: "Prevent use of leaked passwords"

-- Note: This is a dashboard setting, not a SQL command
-- Steps to enable manually:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project: ojwbrhxdencqqrexezhe
-- 3. Go to Authentication > Policies
-- 4. Click on "Security & Protection" tab
-- 5. Toggle ON "Prevent use of leaked passwords"

-- ============================================
-- ADDITIONAL SECURITY RECOMMENDATIONS
-- ============================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add policy for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Add policy for allowing users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Add policy for orders (users can only see their own orders)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add policy for support tickets (users can only see their own tickets)
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR email = auth.email());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify functions have search_path set
SELECT 
  proname AS function_name,
  proconfig AS search_path_setting
FROM pg_proc
WHERE proname IN ('handle_new_user', 'handle_updated_at');

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
