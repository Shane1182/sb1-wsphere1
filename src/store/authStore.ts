import { create } from 'zustand';
import { AuthState, User } from '../types/auth';
import { signIn, signOut, getCurrentUser, AuthenticationError } from '../services/auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  tenantId: null,
  error: null,
  loading: false,
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      console.log('Starting login process for:', email);
      
      const user = await signIn(email, password);
      console.log('Login successful, updating store state');
      
      set({ 
        user, 
        isAuthenticated: true, 
        tenantId: user.tenantId,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Login error in store:', error);
      const message = error instanceof AuthenticationError 
        ? error.message 
        : 'An unexpected error occurred during login';
      set({ loading: false, error: message });
      throw error;
    }
  },
  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        tenantId: null,
        loading: false,
        error: null
      });
    } catch (error) {
      const message = error instanceof AuthenticationError 
        ? error.message 
        : 'Failed to sign out';
      set({ loading: false, error: message });
      throw error;
    }
  },
  initAuth: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Initializing authentication state');
      
      const user = await getCurrentUser();
      if (user) {
        console.log('User session restored:', user.email);
        set({
          user,
          isAuthenticated: true,
          tenantId: user.tenantId,
          loading: false,
          error: null
        });
      } else {
        console.log('No active user session');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      const message = error instanceof AuthenticationError 
        ? error.message 
        : 'Failed to initialize authentication';
      set({ loading: false, error: message });
    }
  },
  clearError: () => set({ error: null }),
}));

// Initialize authentication state when the app loads
useAuthStore.getState().initAuth();