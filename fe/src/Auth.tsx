import { createSignal, createContext, useContext, onMount, Component, JSX } from 'solid-js';
import { toast } from 'solid-toast';
import { jwtDecode } from 'jwt-decode';

// Import semua types dari file terpusat
import { User, AuthContextType, LoginFormData } from './types/user';
import api from './api/api'; // Menggunakan instance API terpusat

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: Component<{ children: JSX.Element }> = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [token, setToken] = createSignal<string | null>(null);

  onMount(() => {
    const savedToken = localStorage.getItem('clinic_auth_token');
    if (savedToken) {
      try {
        const decodedToken: any = jwtDecode(savedToken);
        const userPosition = decodedToken.user_metadata?.position || 'resepsionis';
        const userDataForContext: User = {
          id: decodedToken.sub,
          name: decodedToken.user_metadata?.name || decodedToken.email,
          email: decodedToken.email,
          position: userPosition,
        };
        setUser(userDataForContext);
        setToken(savedToken);
        localStorage.setItem('clinic_user', JSON.stringify(userDataForContext));
      } catch (error) {
        console.error("Failed to decode token from localStorage:", error);
        logout();
      }
    }
  });

  // Fungsi login sekarang menggunakan instance 'api'
  const login = async (data: LoginFormData): Promise<boolean> => {
    try {
      const response = await api.post('/login', { email: data.email, password: data.password }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        const receivedToken = response.data;
        
        try {
          const decodedToken: any = jwtDecode(receivedToken);
          const userPosition = decodedToken.user_metadata?.position || 'resepsionis'; 
          const loggedInUser: User = {
            id: decodedToken.sub,
            name: decodedToken.user_metadata?.name || decodedToken.email,
            email: decodedToken.email,
            position: userPosition,
          };

          setUser(loggedInUser);
          setToken(receivedToken);
          localStorage.setItem('clinic_user', JSON.stringify(loggedInUser));
          localStorage.setItem('clinic_auth_token', receivedToken);

          return true;
        } catch (decodeError) {
          console.error("Failed to decode JWT:", decodeError);
          toast.error("Terjadi kesalahan saat memproses data pengguna.");
          return false;
        }
      } else {
        // Axios akan melemparkan error untuk status selain 2xx, jadi blok ini tidak akan tercapai.
        // Penanganan error akan dilakukan di blok catch.
        return false;
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      let errorMessage = 'Gagal terhubung ke server.';
      if (typeof error === 'object' && error !== null) {
        if ('response' in error && typeof (error as any).response?.data === 'string') {
          errorMessage = (error as any).response.data;
        } else if ('message' in error && typeof (error as any).message === 'string') {
          errorMessage = (error as any).message;
        }
      }
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('clinic_user');
    localStorage.removeItem('clinic_auth_token');
    window.location.href = '/login';
  };

  const isAuthenticated = () => user() !== null && token() !== null;

  const authValue: AuthContextType = {
    user,
    token, 
    isAuthenticated,
    login,
    logout,
    setUser,
    setToken: setToken as (token: string | null) => void,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};