import { Router, Route } from '@solidjs/router';
import { createSignal, createContext, useContext, Component, JSX, onMount } from 'solid-js';
import { Toaster } from 'solid-toast';

// Import pages
import Register from './pages/register';
import VerifyCode from './pages/verifycode';
import Login from './pages/login';
import ForgotPassword from './pages/forgotpassword';
import ResetPassword from './pages/resetpassword';
import Layout from './layouts/layout';
import ProdukTreatmentPage from './pages/produk';
import StaffPage from './pages/Dokter';
import BookingPage from './pages/registrasi';
import PasienDataPage from './pages/pasien';
import CheckoutPage from './pages/pembayaran';
import Dashboard from './pages/dashboard';
import Statistik from './pages/analisis';
import AppointmentSchedulePage from './pages/jadwal';
import LandingPage from './pages/landing';

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

const AuthContext = createContext<AuthContextType>();

const AuthProvider: Component<{ children: JSX.Element }> = (props) => {
  const [user, setUser] = createSignal<User | null>(null);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ProtectedRoute: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();
  if (!auth.isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }
  return <>{props.children}</>;
};

const PublicRoute: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();
  if (auth.isAuthenticated()) {
    window.location.href = '/dashboard';
    return null;
  }
  return <>{props.children}</>;
};

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
      <CheckoutPage />
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/" component={LandingPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/verify-code" component={VerifyCodePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/pasien" component={PasienPage} />
        <Route path="/jadwal" component={JadwalPage} />
        <Route path="/registrasi" component={RegistrasiPage} />
        <Route path="/dokter" component={DokterPage} />
        <Route path="/produk" component={ProdukPage} />
        <Route path="/statistik" component={StatistikPage} />
        <Route path="/pembayaran" component={PembayaranPage} />
        <Route path="*" component={NotFoundPage} />
      </Router>

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
    </AuthProvider>
  );
}

export default App;
