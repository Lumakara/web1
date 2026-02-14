# Google OAuth Setup with Supabase - Comprehensive Guide

> **Version:** 1.0.0  
> **Last Updated:** 2026-02-13  
> **Difficulty:** Beginner to Intermediate  
> **Estimated Time:** 30-45 minutes

---

## 📚 Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Google Cloud Console Setup](#3-step-by-step-google-cloud-console-setup)
4. [Supabase Configuration](#4-supabase-configuration)
5. [Application Code Integration](#5-application-code-integration)
6. [Vercel Deployment Configuration](#6-vercel-deployment-configuration)
7. [Troubleshooting](#7-troubleshooting)
8. [Security Best Practices](#8-security-best-practices)
9. [Testing Checklist](#9-testing-checklist)
10. [Quick Reference](#10-quick-reference)

---

## 1. Overview

### What is OAuth 2.0?

OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to a user's account on another service (like Google) without exposing the user's password. When you implement "Sign in with Google," you're using OAuth 2.0 to delegate authentication to Google.

### How Google OAuth Works with Supabase

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE OAUTH FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

     User          Your App           Supabase          Google          Database
      │               │                  │                │                │
      │  Click Login  │                  │                │                │
      │──────────────▶│                  │                │                │
      │               │  1. Request Auth │                │                │
      │               │─────────────────▶│  2. Redirect   │                │
      │               │                  │───────────────▶│                │
      │               │                  │                │                │
      │               │                  │  3. User Logs  │                │
      │               │                  │◀───────────────│                │
      │               │                  │     In         │                │
      │               │                  │                │                │
      │               │                  │  4. Auth Code  │                │
      │               │  5. Code + Token │◀───────────────│                │
      │               │◀─────────────────│                │                │
      │               │                  │                │                │
      │               │  6. Create/Update│                │  7. Create     │
      │               │     Profile      │───────────────────────────────▶│
      │               │                  │                │                │
      │  8. Redirect  │                  │                │                │
      │◀──────────────│                  │                │                │
      │  to Profile   │                  │                │                │
      │               │                  │                │                │

🔑 KEY POINT: The access token is passed in the URL hash (after `#`), 
   not as a query parameter (after `?`). This is important for security!
```

### Why Use Google OAuth?

| Benefit | Description |
|---------|-------------|
| **Security** | No password storage in your database |
| **User Experience** | One-click login, no registration forms |
| **Trust** | Users trust Google more than unknown websites |
| **Data Accuracy** | Verified email addresses from Google |
| **Profile Data** | Access to name, profile picture automatically |

---

## 2. Prerequisites

### Required Accounts

Before you begin, ensure you have the following:

#### 1. Google Account
- **Purpose:** Access to Google Cloud Console
- **URL:** https://accounts.google.com/signup
- **Requirements:** Any valid Google/Gmail account
- **Cost:** Free

#### 2. Supabase Account
- **Purpose:** Backend database and authentication service
- **URL:** https://supabase.com
- **Requirements:** Email address
- **Cost:** Free tier sufficient for development

#### 3. (Optional) Vercel Account
- **Purpose:** Hosting platform for deployment
- **URL:** https://vercel.com
- **Requirements:** GitHub/GitLab/Bitbucket account
- **Cost:** Free tier for hobby projects

### Technical Requirements

| Requirement | Why It's Needed |
|-------------|-----------------|
| **Modern Web Browser** | Chrome/Firefox/Edge recommended for DevTools |
| **Text Editor** | VS Code, Sublime Text, or similar |
| **Terminal Access** | For running development server |
| **Node.js 18+** | For running React/Vite application |
| **Git** | For version control and deployment |

### Knowledge Prerequisites

You should be familiar with:
- Basic JavaScript/TypeScript
- React fundamentals
- Environment variables concept
- Basic SQL (for database setup)

### Project Structure Assumptions

This guide assumes your project has the following structure:
```
my-project/
├── src/
│   ├── components/
│   │   └── AuthCallback.tsx    # OAuth callback handler
│   ├── lib/
│   │   └── supabase.ts         # Supabase client setup
│   └── App.tsx                 # Main app with routes
├── .env                        # Environment variables
├── vercel.json                 # Vercel configuration
└── package.json
```

---

## 3. Step-by-Step Google Cloud Console Setup

### 3.1 Access Google Cloud Console

#### Step-by-Step:

1. **Open Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Accept Terms (First Time Only)**
   - If this is your first time, you may see a terms of service agreement
   - Read and accept to continue
   - Select your country and agree to terms

> 📸 **Screenshot Description:** You should see the Google Cloud Console dashboard with a project selector dropdown at the top, showing "Select a project" or an existing project name.

---

### 3.2 Create or Select a Project

A Google Cloud project is a container for your resources, settings, and credentials.

#### Creating a New Project:

1. **Open Project Selector**
   - Click the project dropdown at the top of the page (next to "Google Cloud")
   - A modal will appear showing existing projects

2. **Create New Project**
   - Click the **"New Project"** button in the top-right of the modal

3. **Fill Project Details**
   ```
   Project name: Layanan Digital Auth
   Location: No organization (or select your organization)
   ```

4. **Create and Wait**
   - Click **"Create"**
   - Wait 5-10 seconds for the project to be created
   - You'll be automatically switched to the new project

> 📸 **Screenshot Description:** The project selector modal shows your newly created project "Layanan Digital Auth" in the list.

#### Alternative: Use Existing Project

If you already have a project:
1. Select it from the dropdown
2. Click **"Open"**

---

### 3.3 Enable Google+ API (Google People API)

The Google+ API was deprecated and replaced by Google People API. Supabase uses this to fetch user profile information.

#### Step-by-Step:

1. **Navigate to API Library**
   - In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or visit directly: https://console.cloud.google.com/apis/library

2. **Search for the API**
   - In the search bar, type: `Google People API`
   - Press Enter

3. **Enable the API**
   - Click on **"Google People API"** from search results
   - Click the **"Enable"** button
   - Wait for the API to be enabled (usually instant)

> 📸 **Screenshot Description:** The Google People API page shows a green checkmark and "API enabled" status.

#### Verify API is Enabled:

1. Go to **"APIs & Services"** → **"Dashboard"**
2. You should see "Google People API" in the list of enabled APIs

---

### 3.4 Configure OAuth Consent Screen

The OAuth consent screen is what users see when they click "Sign in with Google." It shows your app name, logo, and requested permissions.

#### Understanding User Types:

| Type | Use Case | Who Can Access |
|------|----------|----------------|
| **External** | Production apps open to any Google user | Anyone with a Google account (after verification) |
| **Internal** | Organization-internal apps only | Only users within your Google Workspace organization |

For most projects, choose **External**.

#### Step-by-Step Configuration:

1. **Navigate to OAuth Consent Screen**
   - Left sidebar: **"APIs & Services"** → **"OAuth consent screen"**

2. **Select User Type**
   - Choose **"External"** (for production, public access)
   - Click **"Create"**

> 📸 **Screenshot Description:** You see radio buttons for "External" and "Internal" with descriptions.

3. **App Information Section**

   Fill in the following:
   
   | Field | Value | Description |
   |-------|-------|-------------|
   | **App name** | `Layanan Digital` | The name users will see |
   | **User support email** | `your-email@gmail.com` | Contact email for users |
   | **App logo** | (Optional) Upload your logo | Displayed on consent screen |

   > 💡 **Tip:** Keep the app name consistent with your brand.

4. **App Domain Section**

   These URLs are shown to users and must be valid:
   
   | Field | Example Value |
   |-------|---------------|
   | **Application home page** | `https://your-app.vercel.app` |
   | **Application privacy policy link** | `https://your-app.vercel.app/privacy` |
   | **Application terms of service link** | `https://your-app.vercel.app/terms` |

   > ⚠️ **Important:** These URLs must be publicly accessible. For development, you can use placeholder URLs, but you'll need real ones for verification.

5. **Developer Contact Information**
   
   | Field | Value |
   |-------|-------|
   | **Email addresses** | `your-email@gmail.com` |

6. **Save and Continue**
   - Click **"Save and Continue"** at the bottom

> 📸 **Screenshot Description:** The OAuth consent screen form is filled out with your app information.

#### Scopes Configuration:

Scopes define what user data your app can access:

1. **Add Scopes**
   - On the "Scopes" page, click **"Add or Remove Scopes"**
   - A modal will appear with available scopes

2. **Select Required Scopes**
   ```
   ☐ .../auth/userinfo.email      (View user's email address)
   ☐ .../auth/userinfo.profile    (View user's basic profile info)
   ☐ openid                       (Authenticate using OpenID Connect)
   ```
   
   Check all three boxes above.

3. **Update and Continue**
   - Click **"Update"**
   - Click **"Save and Continue"**

> 📸 **Screenshot Description:** The scopes modal shows checkboxes next to email, profile, and openid scopes.

#### Test Users Configuration (External Apps Only):

While your app is in "Testing" mode, only test users can sign in.

1. **Add Test Users**
   - On the "Test users" page, click **"Add Users"**
   - Enter email addresses for testing:
     ```
     test-user-1@gmail.com
     test-user-2@gmail.com
     ```
   - Click **"Add"**

2. **Save and Continue**
   - Click **"Save and Continue"**

3. **Review Summary**
   - Review all settings
   - Click **"Back to Dashboard"**

> 💡 **Note:** You can add up to 100 test users while in testing mode. For production, you'll need to submit for verification.

---

### 3.5 Create OAuth 2.0 Credentials

Credentials (Client ID and Client Secret) are what your app uses to identify itself to Google.

#### Step-by-Step:

1. **Navigate to Credentials**
   - Left sidebar: **"APIs & Services"** → **"Credentials"**

2. **Create Credentials**
   - Click **"+ Create Credentials"** at the top
   - Select **"OAuth client ID"** from the dropdown

> 📸 **Screenshot Description:** A dropdown menu shows "OAuth client ID" as an option.

3. **Select Application Type**
   - Choose **"Web application"**
   - This is for web apps running in browsers

4. **Name Your Client**
   ```
   Name: Layanan Digital Web Client
   ```

5. **Authorized JavaScript Origins**

   These are the domains where your app can make OAuth requests from:
   
   ```
   URI 1: http://localhost:5173
   URI 2: https://your-app.vercel.app
   ```
   
   | Origin | Purpose |
   |--------|---------|
   | `http://localhost:5173` | Local development (Vite default) |
   | `https://your-app.vercel.app` | Production deployment |

   > ⚠️ **Important:** Do NOT include paths (like `/auth/callback`) here. Origins should end at the domain.

   Click **"Add URI"** for each origin.

6. **Authorized Redirect URIs**

   These are the URLs Google will redirect to after authentication:
   
   ```
   URI 1: https://your-project-id.supabase.co/auth/v1/callback
   URI 2: https://your-app.vercel.app/auth/callback
   URI 3: http://localhost:5173/auth/callback
   ```

   | URI | Purpose |
   |-----|---------|
   | Supabase callback | Required for Supabase Auth to process the token |
   | Production callback | Your production app callback URL |
   | Local callback | Your development callback URL |

   > 🔑 **Critical:** These URLs must match exactly what's configured in Supabase and your app. Even a trailing slash difference causes errors!

   Click **"Add URI"** for each redirect URI.

> 📸 **Screenshot Description:** The credentials form shows both origins and redirect URIs filled in.

7. **Create and Save Credentials**
   - Click **"Create"**
   - A modal will appear with your **Client ID** and **Client Secret**

8. **Download and Store Safely**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  ⚠️  IMPORTANT: SAVE THESE CREDENTIALS NOW!                │
   │                                                              │
   │  Client ID:                                                  │
   │  123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com  │
   │                                                              │
   │  Client Secret:                                              │
   │  GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx                         │
   │                                                              │
   │  📥 Click "Download JSON" for backup                        │
   └─────────────────────────────────────────────────────────────┘
   ```

   - Click **"Download JSON"** to save a backup
   - Store the file securely
   - Click **"OK"** to close the modal

> ⚠️ **Security Warning:** Never commit these credentials to public repositories! The Client Secret should only be stored in environment variables.

---

### 3.6 Understanding the Credentials

#### Client ID
```
Format: xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Example: 123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
```
- **Public identifier** for your app
- Safe to expose in frontend code
- Used to identify which app is making the request

#### Client Secret
```
Format: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
Example: 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o5p6
```
- **Private key** for your app
- **Never expose in frontend code!**
- Only used server-side (or by Supabase)
- If compromised, regenerate immediately

---

## 4. Supabase Configuration

### 4.1 Access Supabase Dashboard

1. **Login to Supabase**
   - Visit: https://app.supabase.com
   - Sign in with your account

2. **Select Your Project**
   - Click on your project name from the dashboard
   - You'll see the project overview

> 📸 **Screenshot Description:** Supabase dashboard shows your project with sections for Database, Authentication, Storage, etc.

---

### 4.2 Configure Google Provider

1. **Navigate to Auth Settings**
   - Left sidebar: Click **"Authentication"**
   - Click **"Providers"** from the submenu

2. **Enable Google Provider**
   - Find **"Google"** in the list of providers
   - Click on it to expand settings
   - Toggle **"Enable Google"** to ON

> 📸 **Screenshot Description:** The Google provider toggle is switched ON (blue).

3. **Enter Google Credentials**

   Paste your credentials from Google Cloud Console:
   
   ```
   Client ID (for OAuth): 
   [Paste your Client ID here]
   
   Client Secret (for OAuth):
   [Paste your Client Secret here]
   ```

4. **Configure Redirect URL**

   The redirect URL tells Supabase where to send users after authentication:
   
   ```
   Redirect URL: https://your-app.vercel.app/auth/callback
   ```

   > 💡 **Note:** This should match the Authorized Redirect URI you set in Google Cloud Console.

5. **Save Changes**
   - Click **"Save"** at the bottom

> 📸 **Screenshot Description:** Green success notification appears: "Settings updated successfully."

---

### 4.3 Configure URL Settings

1. **Navigate to URL Configuration**
   - Left sidebar: **"Authentication"** → **"URL Configuration"**

2. **Set Site URL**
   ```
   Site URL: https://your-app.vercel.app
   ```
   
   This is your main application URL.

3. **Add Additional Redirect URLs**
   
   In the "Additional Redirect URLs" field, add:
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:5173/auth/callback
   ```
   
   Each URL on a new line.

4. **Save Settings**
   - Click **"Save"**

> 📸 **Screenshot Description:** URL Configuration page shows Site URL and redirect URLs configured.

---

### 4.4 Database Setup (Profiles Table)

Your app needs a `profiles` table to store additional user information beyond what Supabase Auth stores.

#### Using Supabase SQL Editor:

1. **Open SQL Editor**
   - Left sidebar: **"SQL Editor"** (or "SQL")
   - Click **"New Query"**

2. **Run the Following SQL:**

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create index for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

3. **Run the Query**
   - Click **"Run"** or press Ctrl+Enter
   - Wait for "Success. No rows returned"

> 📸 **Screenshot Description:** SQL Editor shows successful execution with green checkmark.

#### Create Auto-Profile Trigger:

This trigger automatically creates a profile when a new user signs up:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Run this in the SQL Editor as well.

---

## 5. Application Code Integration

### 5.1 Environment Variables Setup

Create a `.env` file in your project root:

```bash
# ============================================
# WEBSITE CONFIGURATION
# ============================================
VITE_SITE_NAME=Layanan Digital
VITE_SITE_DESCRIPTION="Solusi Digital untuk Kebutuhan Anda"
VITE_SITE_URL=https://your-app.vercel.app

# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Getting Supabase Credentials:

1. In Supabase Dashboard, click **Settings** (gear icon)
2. Select **API** from the menu
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

> ⚠️ **Important:** Never commit `.env` files to git! Add `.env` to your `.gitignore` file.

---

### 5.2 Supabase Client Setup

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Important for OAuth callback
  },
});

// Type definitions for your database
type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          is_admin?: boolean;
        };
        Update: {
          full_name?: string;
          avatar_url?: string;
          is_admin?: boolean;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
```

---

### 5.3 Login Button Component

Create `src/components/GoogleLoginButton.tsx`:

```typescript
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // Optional: Request additional scopes
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
      // User will be redirected to Google
      // No code needed here - Supabase handles the redirect
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-login-container">
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="google-login-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 24px',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          background: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {/* Google Logo SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8055.54-1.8364.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"
          />
          <path
            fill="#EA4335"
            d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
          />
        </svg>
        
        <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
      </button>

      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
```

---

### 5.4 OAuth Callback Handler

Create `src/components/AuthCallback.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔑 Auth callback triggered');
        console.log('📍 Full URL:', window.location.href);
        console.log('🔖 Hash:', window.location.hash);
        console.log('❓ Search:', window.location.search);

        // IMPORTANT: Supabase stores the OAuth tokens in the URL hash (after #)
        // NOT in query parameters (after ?)
        // The URL looks like: /auth/callback#access_token=xxx&refresh_token=yyy

        // Supabase client automatically detects and processes the session
        // from the URL hash when detectSessionInUrl is true
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session error:', error);
          throw error;
        }

        if (session) {
          console.log('✅ Session obtained:', {
            user: session.user.email,
            provider: session.user.app_metadata?.provider,
          });

          // Verify profile was created
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Profile fetch error:', profileError);
          }

          if (profile) {
            console.log('✅ User profile found:', profile.full_name);
          } else {
            console.warn('⚠️ Profile not found, may need to be created manually');
          }

          setStatus('success');
          setMessage('Login successful! Redirecting...');

          // Redirect after a short delay
          setTimeout(() => {
            navigate('/profile', { replace: true });
          }, 1500);
        } else {
          // No session found - try to exchange the code
          console.log('⚠️ No session found, checking for auth code...');
          
          // If there's an error in the URL
          const params = new URLSearchParams(window.location.search);
          const errorDescription = params.get('error_description');
          
          if (errorDescription) {
            throw new Error(errorDescription);
          }

          throw new Error('No session found. Please try logging in again.');
        }
      } catch (err) {
        console.error('❌ Callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  // Render appropriate UI based on status
  return (
    <div className="auth-callback-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
    }}>
      {status === 'processing' && (
        <>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ marginTop: '20px' }}>{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ color: 'green', fontSize: '48px' }}>✓</div>
          <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ color: 'red', fontSize: '48px' }}>✗</div>
          <p style={{ marginTop: '20px', color: 'red' }}>{message}</p>
          <p style={{ marginTop: '10px', color: '#666' }}>
            Redirecting to login page...
          </p>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

---

### 5.5 Add Route in App.tsx

Update your main App component to include the callback route:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleLoginButton } from './components/GoogleLoginButton';
import { AuthCallback } from './components/AuthCallback';
import { Profile } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your other routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* IMPORTANT: OAuth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### 5.6 User Profile Page

Create `src/pages/Profile.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Profile as ProfileType } from '../lib/supabase';

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        setUser(session.user);

        // Get profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      
      {profile?.avatar_url && (
        <img 
          src={profile.avatar_url} 
          alt="Profile" 
          style={{ width: '100px', height: '100px', borderRadius: '50%' }}
        />
      )}
      
      <div className="profile-info">
        <p><strong>Name:</strong> {profile?.full_name}</p>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Provider:</strong> {user?.app_metadata?.provider}</p>
        <p><strong>Joined:</strong> {new Date(profile?.created_at || '').toLocaleDateString()}</p>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
}
```

---

## 6. Vercel Deployment Configuration

### 6.1 Environment Variables in Vercel

#### Step-by-Step:

1. **Login to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click the **"Settings"** tab
   - Select **"Environment Variables"** from the left menu

3. **Add Environment Variables**

   Add each variable from your `.env` file:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SITE_NAME` | `Layanan Digital` | Production, Preview, Development |
   | `VITE_SITE_URL` | `https://your-app.vercel.app` | Production |
   | `VITE_SITE_URL` | `http://localhost:5173` | Development |
   | `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | All |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | All |

4. **Save Variables**
   - Click **"Save"** for each variable

> 📸 **Screenshot Description:** Vercel settings page shows environment variables filled in.

---

### 6.2 Configure vercel.json

Create or update `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/auth/callback",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Why This Configuration?

| Setting | Purpose |
|---------|---------|
| `rewrites` | Ensures React Router handles all routes, including `/auth/callback` |
| `headers` | Adds security headers for production |

---

### 6.3 Deploy to Vercel

#### Using Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Using Git Integration:

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository in Vercel dashboard
3. Vercel auto-deploys on every push

---

### 6.4 Common Deployment Issues

#### Issue 1: 404 on Callback URL

**Symptoms:** After Google login, user sees "404 Not Found"

**Solution:**
- Ensure `vercel.json` has rewrite rule for `/auth/callback`
- Verify the route exists in your React Router configuration
- Redeploy after fixing

#### Issue 2: Environment Variables Not Loaded

**Symptoms:** "Missing Supabase environment variables" error

**Solution:**
- Double-check variable names match exactly (case-sensitive)
- Ensure variables are set for the correct environment (Production/Preview)
- Redeploy after adding variables

#### Issue 3: Redirect URI Mismatch in Production

**Symptoms:** Google shows "redirect_uri_mismatch" error

**Solution:**
- Add production URL to Google Cloud Console Authorized Redirect URIs
- Update Supabase URL Configuration with production URL
- Wait 5 minutes for changes to propagate

---

## 7. Troubleshooting

### 7.1 "redirect_uri_mismatch" Error

**Error Message:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized for the OAuth client.
```

**Root Cause:** The redirect URI in the request doesn't exactly match what's configured in Google Cloud Console.

**Diagnosis Checklist:**
- [ ] Check for trailing slashes (`/callback` vs `/callback/`)
- [ ] Verify http vs https protocol
- [ ] Check for www vs non-www
- [ ] Ensure no extra query parameters

**Solution:**

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add ALL variations:
   ```
   https://your-app.vercel.app/auth/callback
   https://www.your-app.vercel.app/auth/callback
   http://localhost:5173/auth/callback
   ```
4. Save and wait 5 minutes

---

### 7.2 "403: org_internal" Error

**Error Message:**
```
Error 403: org_internal
This app is not accessible to users outside of the organization.
```

**Root Cause:** OAuth consent screen is set to "Internal" but user is outside the organization.

**Solution:**

1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Change User Type from "Internal" to "External"
3. OR add the user to your Google Workspace organization
4. For External apps in Testing mode: Add user's email to "Test users"

---

### 7.3 "Token Expired" Issues

**Symptoms:** User gets logged out unexpectedly or sees session errors

**Root Cause:** Supabase sessions expire after 1 hour (by default) and refresh tokens may fail.

**Solution:**

```typescript
// Add this to your supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Optional: Customize session duration
    // sessionDuration: 3600, // 1 hour (default)
  },
});

// Implement auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  
  if (event === 'SIGNED_OUT') {
    // Redirect to login or clear local state
    window.location.href = '/login';
  }
});
```

---

### 7.4 User Profile Not Created

**Symptoms:** User logs in but no profile record exists in database

**Root Cause:** The database trigger `on_auth_user_created` is not set up or failed.

**Solution:**

1. **Check if trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Recreate trigger if missing:**
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Create missing profiles manually:**
   ```sql
   -- Find users without profiles
   SELECT u.id, u.email 
   FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id
   WHERE p.id IS NULL;
   
   -- Create profiles for them
   INSERT INTO public.profiles (id, email, full_name)
   SELECT 
     u.id,
     u.email,
     COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
   FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id
   WHERE p.id IS NULL;
   ```

---

### 7.5 404 Errors After Login

**Symptoms:** User authenticates successfully but lands on 404 page

**Root Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Missing rewrite rule | Add `/auth/callback` rewrite in `vercel.json` |
| Wrong callback path | Ensure path matches in all configurations |
| Missing route in React Router | Add `<Route path="/auth/callback" />` |
| Browser cache | Clear cache and hard reload (Ctrl+Shift+R) |

---

### 7.6 "This App is Not Verified" Warning

**Symptoms:** Google shows a scary warning about unverified apps

**Explanation:** While in "Testing" mode, users see this warning. It doesn't prevent login.

**For Testing:**
- Click "Advanced" → "Go to [Your App] (unsafe)"
- Or add users to "Test users" list for a smoother experience

**For Production:**
1. Go to Google Cloud Console → OAuth consent screen
2. Click **"PUBLISH APP"** or **"Submit for verification"**
3. Fill out the verification form
4. Wait 3-5 business days for Google review

---

### 7.7 CORS Errors

**Error Message:**
```
Access to fetch at 'https://your-project.supabase.co/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy.
```

**Solution:**

1. Go to Supabase Dashboard → Settings → API
2. Under "Allowed Origins", add:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
3. Save changes

---

## 8. Security Best Practices

### 8.1 Keep Credentials Safe

#### DO:
- ✅ Store Client Secret in environment variables only
- ✅ Add `.env` to `.gitignore`
- ✅ Use different credentials for development and production
- ✅ Rotate credentials if compromised

#### DON'T:
- ❌ Never commit `.env` files to git
- ❌ Never expose Client Secret in frontend code
- ❌ Never share credentials in chat/email
- ❌ Never hardcode credentials in source code

### 8.2 Environment Variables Setup

#### .gitignore
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production

# Credentials
*.credentials.json
client_secret*.json
```

#### .env.example (Safe to commit)
```bash
# Copy this file to .env and fill in your values
VITE_SITE_URL=https://your-app.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 8.3 HTTPS Requirements

| Environment | Protocol | Reason |
|-------------|----------|--------|
| Production | HTTPS Required | Google OAuth requires HTTPS for production |
| Development | HTTP Allowed | Localhost can use HTTP |

**Enforce HTTPS in Production:**
```javascript
// Add to your app entry point
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
  window.location.href = window.location.href.replace('http:', 'https:');
}
```

### 8.4 Token Handling

```typescript
// Good: Let Supabase handle token storage
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// Supabase automatically:
// 1. Stores tokens securely (localStorage by default)
// 2. Refreshes expired tokens
// 3. Validates tokens on each request
```

### 8.5 User Data Validation

Always validate user data server-side (in RLS policies):

```sql
-- Only allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 9. Testing Checklist

### 9.1 Local Testing Steps

```
□ 1. Start development server
    npm run dev
    
□ 2. Navigate to login page
    http://localhost:5173/login
    
□ 3. Click "Sign in with Google"
    - Should redirect to Google login page
    
□ 4. Complete Google authentication
    - Login with test account
    - Accept permissions
    
□ 5. Verify callback handling
    - URL should be: http://localhost:5173/auth/callback#...
    - Should show success message
    - Should redirect to profile page
    
□ 6. Check user data
    - Profile page shows correct name and email
    - Avatar loads correctly
    
□ 7. Verify database
    - New row in auth.users table
    - New row in public.profiles table
    
□ 8. Test logout
    - Click logout button
    - Should redirect to login page
    - Session should be cleared
    
□ 9. Test re-login
    - Login again with same account
    - Should work smoothly (no duplicate profiles)
```

### 9.2 Production Testing Steps

```
□ 1. Deploy to production
    vercel --prod
    
□ 2. Update Google Cloud Console URLs
    - Add production URLs to Authorized Redirect URIs
    - Add production URLs to JavaScript Origins
    
□ 3. Update Supabase URL Configuration
    - Set Site URL to production URL
    - Add production callback URL
    
□ 4. Test production login
    - Visit https://your-app.vercel.app
    - Click "Sign in with Google"
    - Complete authentication
    
□ 5. Verify HTTPS
    - All URLs use https://
    - No mixed content warnings
    
□ 6. Test across browsers
    - Chrome
    - Firefox
    - Safari
    - Edge
    
□ 7. Test incognito mode
    - Should work without cached data
    
□ 8. Test with different Google accounts
    - Gmail account
    - Google Workspace account
```

### 9.3 What to Verify After Setup

| Component | What to Check | Expected Result |
|-----------|---------------|-----------------|
| **Google OAuth** | Consent screen displays | Shows app name, logo, requested permissions |
| **Callback URL** | URL hash contains token | `.../auth/callback#access_token=...` |
| **Session** | User stays logged in | Refresh page, user still authenticated |
| **Profile** | Database record created | Row exists in `profiles` table |
| **Avatar** | Profile image loads | Google profile picture displays |
| **Logout** | Session cleared | User redirected to login, can't access profile |
| **Re-login** | Existing profile used | No duplicate profile created |
| **Error Handling** | Cancel login | App handles gracefully, no crash |

---

## 10. Quick Reference

### Quick Commands

```bash
# Install dependencies
npm install @supabase/supabase-js

# Start development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### URL Patterns

| Purpose | URL Pattern |
|---------|-------------|
| Google Cloud Console | https://console.cloud.google.com/ |
| Supabase Dashboard | https://app.supabase.com/ |
| Vercel Dashboard | https://vercel.com/dashboard |
| Local Dev | http://localhost:5173 |

### Key File Locations

| File | Purpose |
|------|---------|
| `.env` | Environment variables (never commit!) |
| `vercel.json` | Vercel deployment configuration |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/components/AuthCallback.tsx` | OAuth callback handler |
| `src/components/GoogleLoginButton.tsx` | Login button component |

### Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `400: redirect_uri_mismatch` | Redirect URI doesn't match | Check Google Cloud Console settings |
| `403: org_internal` | App restricted to organization | Change to External or add test users |
| `401: invalid_client` | Client ID/Secret incorrect | Re-copy credentials from Google Cloud |
| `invalid_grant` | Authorization code expired | Try logging in again |
| `access_denied` | User denied permissions | Normal, handle gracefully |

---

## Appendix A: Complete Code Example

### Full AuthCallback Component

```typescript
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuthStatus = 'processing' | 'success' | 'error';

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<AuthStatus>('processing');
  const [message, setMessage] = useState('Completing sign in...');
  const [errorDetails, setErrorDetails] = useState<string>('');

  const handleAuthCallback = useCallback(async () => {
    console.group('🔐 OAuth Callback Debug');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔖 Hash fragment:', location.hash);
    console.log('❓ Query params:', location.search);

    try {
      // Check for error parameters in URL
      const params = new URLSearchParams(location.search);
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');

      if (errorParam) {
        throw new Error(errorDescription || `OAuth error: ${errorParam}`);
      }

      // Get the current session
      // Supabase automatically handles the hash fragment
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.warn('No session found, checking for auth code exchange...');
        
        // Attempt to exchange code if present
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          throw new Error('No authentication session or code found. Please try again.');
        }
      }

      // Verify session was established
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Failed to retrieve user information');
      }

      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
      });

      // Check/Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError);
      }

      if (!profile) {
        console.log('Creating new profile...');
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
          });

        if (createError) {
          console.error('Profile creation error:', createError);
        }
      }

      setStatus('success');
      setMessage('Sign in successful! Redirecting...');

      // Redirect after short delay
      setTimeout(() => {
        const returnUrl = sessionStorage.getItem('authReturnUrl') || '/profile';
        sessionStorage.removeItem('authReturnUrl');
        navigate(returnUrl, { replace: true });
      }, 1500);

    } catch (err) {
      console.error('❌ Auth callback error:', err);
      setStatus('error');
      setMessage('Authentication failed');
      setErrorDetails(err instanceof Error ? err.message : 'Unknown error');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 5000);
    } finally {
      console.groupEnd();
    }
  }, [location, navigate]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  // Render UI based on status...
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {status === 'processing' && <LoadingSpinner message={message} />}
      {status === 'success' && <SuccessMessage message={message} />}
      {status === 'error' && <ErrorMessage message={message} details={errorDetails} />}
    </div>
  );
}

// Sub-components
function LoadingSpinner({ message }: { message: string }) {
  return (
    <>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e3e3e3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#22c55e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
      }}>✓</div>
      <p style={{ marginTop: '16px', color: '#22c55e', fontWeight: 500 }}>{message}</p>
    </>
  );
}

function ErrorMessage({ message, details }: { message: string; details: string }) {
  return (
    <>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
      }}>✕</div>
      <p style={{ marginTop: '16px', color: '#ef4444', fontWeight: 500 }}>{message}</p>
      {details && (
        <p style={{ marginTop: '8px', color: '#666', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
          {details}
        </p>
      )}
      <p style={{ marginTop: '16px', color: '#999', fontSize: '14px' }}>
        Redirecting to login page...
      </p>
    </>
  );
}
```

---

## Support and Resources

### Getting Help

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for error messages

2. **Check Supabase Logs**
   - Supabase Dashboard → Authentication → Logs
   - Review recent auth attempts

3. **Check Google Cloud Console**
   - APIs & Services → Credentials
   - Verify all URLs are correct

4. **Common Resources**
   - [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
   - [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
   - [Vercel Documentation](https://vercel.com/docs)

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Maintainer:** Development Team
