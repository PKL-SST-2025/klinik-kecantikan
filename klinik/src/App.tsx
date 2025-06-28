import { Router, Route } from '@solidjs/router';
import { createSignal, createContext, useContext, Component, JSX, onMount } from 'solid-js';
import { Toaster } from 'solid-toast';

// Import pages
import Register from './pages/register';
import VerifyCode from './pages/verifycode';
import Login from './pages/login';
import ForgotPassword from './pages/forgotpassword';
import ResetPassword from './pages/resetpassword';
import Layout from './pages/layout';

// Auth Context Types
interface User {
  id: string;
  nama: string;
  email: string;
  posisi: 'admin' | 'resepsionis' | 'dokter';
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
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('clinic_user');
      }
    }
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call - replace with actual authentication logic
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo credentials - replace with actual authentication
        if (email === 'admin@clinic.com' && password === 'admin123') {
          const userData: User = {
            id: '1',
            nama: 'Administrator',
            email: email,
            posisi: 'admin'
          };
          setUser(userData);
          localStorage.setItem('clinic_user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          resolve(true);
        } else if (email === 'dokter@clinic.com' && password === 'dokter123') {
          const userData: User = {
            id: '2',
            nama: 'Dr. John Doe',
            email: email,
            posisi: 'dokter'
          };
          setUser(userData);
          localStorage.setItem('clinic_user', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', email);
          resolve(true);
        } else if (email === 'resepsionis@clinic.com' && password === 'resepsionis123') {
          const userData: User = {
            id: '3',
            nama: 'Jane Smith',
            email: email,
            posisi: 'resepsionis'
          };
          setUser(userData);
          localStorage.setItem('clinic_user', JSON.stringify(userData));
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
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }
  
  return <>{props.children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();
  
  if (auth.isAuthenticated()) {
    // Redirect to dashboard if already authenticated
    window.location.href = '/dashboard';
    return null;
  }
  
  return <>{props.children}</>;
};

// Page Components
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
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <h3 class="text-lg font-semibold mb-2">Total Pasien</h3>
              <p class="text-3xl font-bold">1,234</p>
            </div>
            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <h3 class="text-lg font-semibold mb-2">Janji Hari Ini</h3>
              <p class="text-3xl font-bold">45</p>
            </div>
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 class="text-lg font-semibold mb-2">Treatment Aktif</h3>
              <p class="text-3xl font-bold">89</p>
            </div>
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <h3 class="text-lg font-semibold mb-2">Pendapatan Bulan Ini</h3>
              <p class="text-3xl font-bold">Rp 45M</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  </ProtectedRoute>
);

const PasienPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Data Pasien</h1>
        <p class="text-gray-600">Halaman data pasien akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const JadwalPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Jadwal Appointment</h1>
        <p class="text-gray-600">Halaman jadwal appointment akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const RegistrasiPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Registrasi Pasien</h1>
        <p class="text-gray-600">Halaman registrasi pasien baru akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const DokterPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Data Dokter</h1>
        <p class="text-gray-600">Halaman data dokter akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const ProdukPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Produk & Treatment</h1>
        <p class="text-gray-600">Halaman produk dan treatment akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const StatistikPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Statistik & Laporan</h1>
        <p class="text-gray-600">Halaman statistik dan laporan akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const PembayaranPage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Pembayaran</h1>
        <p class="text-gray-600">Halaman pembayaran akan ditampilkan di sini.</p>
      </div>
    </Layout>
  </ProtectedRoute>
);

const ProfilePage = () => (
  <ProtectedRoute>
    <Layout>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        <p class="text-gray-600">Halaman profile pengguna akan ditampilkan di sini.</p>
      </div>
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
      <div class="min-h-screen bg-gray-50">
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
          <Route path="/profile" component={ProfilePage} />

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
        
        {/* Toast Container */}
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
      </div>
    </AuthProvider>
  );
}

export default App;