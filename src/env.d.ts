/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_NAME: string;
  readonly VITE_SITE_DESCRIPTION: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_SITE_LOGO_URL: string;
  readonly VITE_OWNER_NAME: string;
  readonly VITE_OWNER_EMAIL: string;
  readonly VITE_OWNER_PHONE: string;
  readonly VITE_OWNER_WHATSAPP: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_FACEBOOK_URL: string;
  readonly VITE_TWITTER_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_WELCOME_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_OWNER_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PAYMENT_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_PAKASIR_SLUG: string;
  readonly VITE_PAKASIR_API_KEY: string;
  readonly VITE_PTERODACTYL_API_URL: string;
  readonly VITE_PTERODACTYL_API_KEY: string;
  readonly VITE_PTERODACTYL_CLIENT_API_KEY: string;
  readonly VITE_PTERODACTYL_NODE_ID: string;
  readonly VITE_PTERODACTYL_LOCATION_ID: string;
  readonly VITE_PTERODACTYL_EGG_ID: string;
  readonly VITE_PTERODACTYL_NEST_ID: string;
  readonly VITE_Kimi_API_KEY: string;
  readonly VITE_Kimi_MODEL: string;
  readonly VITE_ENABLE_PAYMENT: string;
  readonly VITE_ENABLE_LIVE_CHAT: string;
  readonly VITE_ENABLE_PTERODACTYL: string;
  readonly VITE_ENABLE_WIFI_INSTALLATION: string;
  readonly VITE_ENABLE_EMAIL_NOTIFICATIONS: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_MOCK_PAYMENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
