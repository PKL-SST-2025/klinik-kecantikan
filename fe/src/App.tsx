//src/App.tsx
import { Router, Route } from '@solidjs/router';
import { createSignal, createContext, useContext, Component, JSX, onMount } from 'solid-js';
import { Toaster } from 'solid-toast';

// Import pages
import Register from './pages/register';
import VerifyCode from './pages/verifycode';
import Login from './pages/login';
import ForgotPassword from './pages/forgotpassword';
import ResetPassword from './pages/resetpassword';
import Layout from './layouts/layout' // Ini adalah Layout.tsx Anda
import ProdukTreatmentPage from './pages/produk'; // Pastikan path ini sesuai dengan struktur proyek Anda
import StaffPage from './pages/Dokter';
import BookingPage from './pages/registrasi';
import PasienDataPage from './pages/pasien';
import CheckoutPage from './pages/pembayaran';
import Dashboard from './pages/dashboard';
import Statistik from './pages/analisis'; // Pastikan path ini sesuai dengan struktur proyek Anda
import AppointmentSchedulePage from './pages/jadwal'; // Pastikan path ini sesuai dengan struktur proyek Anda
// Auth Context Types
interface User {
  id: string; 
  name: string; 
  email: string;
  position: 'admin' | 'resepsionis' | 'dokter'; 
  password?: string; 
}

interface AuthContextType {
  user: () => User | null;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType>();

// Auth Provider Component
const AuthProvider: Component<{ children: JSX.Element }> = (props) => {
  const [user, setUser] = createSignal<User | null>(null);

  // Check if user is authenticated on app load
  onMount(() => {
    const savedUser = localStorage.getItem('clinic_user');
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        const userWithoutPassword = { ...parsedUser };
        delete userWithoutPassword.password; 
        setUser(userWithoutPassword);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('clinic_user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
      }
    }
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const registeredUsers: User[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const foundUser = registeredUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (foundUser) {
          const userDataForContext: User = {
            id: foundUser.email, 
            name: foundUser.name,
            email: foundUser.email,
            position: foundUser.position
          };
          setUser(userDataForContext);
          localStorage.setItem('clinic_user', JSON.stringify(userDataForContext)); 
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinic_user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    window.location.href = '/login'; 
  };

  const isAuthenticated = () => user() !== null;

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={authValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }
  
  return <>{props.children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();
  
  if (auth.isAuthenticated()) {
    window.location.href = '/dashboard';
    return null;
  }
  
  return <>{props.children}</>;
};

// Page Components (tetap sama)
const RegisterPage = () => (
  <PublicRoute>
    <Register />
  </PublicRoute>
);

const VerifyCodePage = () => (
  <PublicRoute>
    <VerifyCode />
  </PublicRoute>
);

const LoginPage = () => (
  <PublicRoute>
    <Login />
  </PublicRoute>
);

const ForgotPasswordPage = () => (
  <PublicRoute>
    <ForgotPassword />
  </PublicRoute>
);

const ResetPasswordPage = () => (
  <PublicRoute>
    <ResetPassword />
  </PublicRoute>
);

const DashboardPage = () => (
  <ProtectedRoute>
    <Layout>
      <Dashboard />
    </Layout>
  </ProtectedRoute>
);

const PasienPage = () => (
  <ProtectedRoute>
    <Layout>
      <PasienDataPage />
    </Layout>
  </ProtectedRoute>
);

const JadwalPage = () => (
  <ProtectedRoute>
    <Layout>
     <AppointmentSchedulePage />
    </Layout>
  </ProtectedRoute>
);

const RegistrasiPage = () => (
  <ProtectedRoute>
    <Layout>
      <BookingPage />
    </Layout>
  </ProtectedRoute>
);

const DokterPage = () => (
  <ProtectedRoute>
    <Layout>
      <StaffPage />
    </Layout>
  </ProtectedRoute>
);

const ProdukPage = () => (
  <ProtectedRoute>
    <Layout>
      <ProdukTreatmentPage />
    </Layout>
  </ProtectedRoute>
);

const StatistikPage = () => (
  <ProtectedRoute>
    <Layout>
      <Statistik />
    </Layout>
  </ProtectedRoute>
);

const PembayaranPage = () => (
  <ProtectedRoute>
    <Layout>
      < CheckoutPage />
    </Layout>
  </ProtectedRoute>
);



const NotFoundPage = () => (
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900">404</h1>
      <p class="text-xl text-gray-600 mt-4">Halaman tidak ditemukan</p>
      <a href="/dashboard" class="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <AuthProvider>
      {/* Hapus div ini. Layout component akan menyediakan min-h-screen dan background */}
      {/* <div class="min-h-screen bg-gray-50"> */}
        <Router>
          {/* Public Routes */}
          <Route path="/register" component={RegisterPage} />
          <Route path="/verify-code" component={VerifyCodePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />

          {/* Protected Routes */}
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/pasien" component={PasienPage} />
          <Route path="/jadwal" component={JadwalPage} />
          <Route path="/registrasi" component={RegistrasiPage} />
          <Route path="/dokter" component={DokterPage} />
          <Route path="/produk" component={ProdukPage} />
          <Route path="/statistik" component={StatistikPage} />
          <Route path="/pembayaran" component={PembayaranPage} />

          {/* Default redirect */}
          <Route path="/" component={() => {
            const auth = useAuth();
            if (auth.isAuthenticated()) {
              window.location.href = '/dashboard';
            } else {
              window.location.href = '/login';
            }
            return null;
          }} />
          
          {/* 404 Route */}
          <Route path="*" component={NotFoundPage} />
        </Router>
        
        {/* Toast Container - Letakkan ini di luar Router tapi di dalam AuthProvider */}
        <Toaster
          position="top-right"
          containerClassName="z-50"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          }}
        />
      {/* </div> */} {/* Hapus penutup div ini juga */}
    </AuthProvider>
  );
}

export default App;