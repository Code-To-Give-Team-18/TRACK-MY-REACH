// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'pending';
  profile_image_url: string;
  referral_code?: string;
  last_active_at: number;
  created_at: number;
  updated_at: number;
  settings?: UserSettings;
}

export interface UserSettings {
  ui?: Record<string, any>;
}

// Auth types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'pending';
  profile_image_url: string;
  referral_code?: string;
}

// File types
export interface FileModel {
  id: string;
  filename: string;
  user_id: string;
  meta: {
    content_type: string;
    size: number;
    path: string;
  };
  created_at: number;
  updated_at: number;
}

// API Response types
export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Config types
export interface AppConfig {
  name: string;
  version: string;
  default_locale: string;
  default_models: string[];
  default_prompt_suggestions: PromptSuggestion[];
  features: {
    auth: boolean;
    auth_trusted_header: boolean;
    enable_signup: boolean;
    enable_community_sharing: boolean;
    enable_admin_export: boolean;
  };
  oauth: {
    providers: Record<string, string>;
  };
}

export interface PromptSuggestion {
  title: string[];
  content: string;
}

// WebSocket types
export interface SocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}