// src/App.tsx
import { Router, Route } from '@solidjs/router';
import { Component, JSX } from 'solid-js';
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

// Import auth logic dari file baru
import { AuthProvider, useAuth } from './Auth'; 

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