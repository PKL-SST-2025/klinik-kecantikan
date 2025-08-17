// src/types/user.ts

import { JSX } from 'solid-js';

// Interface untuk data pengguna yang disimpan di frontend
export interface User {
  id: string;
  name: string;
  email: string;
  position: 'admin' | 'resepsionis' | 'dokter';
}

// Interface untuk data login dari form
export interface LoginFormData {
  email: string;
  password: string;
}

// Interface untuk data registrasi dari form
export interface RegisterFormData {
  name: string;
  position: 'admin' | 'resepsionis' | 'dokter' | '';
  email: string;
  password: string;
  confirmPassword: string;
}

// Interface untuk konteks autentikasi di SolidJS
export interface AuthContextType {
  user: () => User | null;
  token: () => string | null;
  isAuthenticated: () => boolean;
  login: (data: LoginFormData) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// Interface untuk props AuthProvider
export interface AuthProviderProps {
  children: JSX.Element;
}