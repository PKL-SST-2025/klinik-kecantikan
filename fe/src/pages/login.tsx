import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';
import { A } from '@solidjs/router';
// Import useAuth Hook
import { useAuth } from '../App'; // Asumsi App.tsx ada di direktori yang sama atau bisa disesuaikan
import BgDashboard from '.././icons/bglogin.png';
const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Menggunakan fungsi login dari AuthContext
  const [formData, setFormData] = createSignal({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const data = formData();

    if (!data.email || !data.password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    if (!data.email.includes('@')) {
      toast.error('Format email tidak valid');
      return;
    }

    setIsLoading(true);

    // --- Logika Verifikasi Login dari localStorage ---
    try {
      const success = await authLogin(data.email, data.password); // Memanggil login dari AuthContext

      if (success) {
        toast.success('Login berhasil!');
        navigate('/dashboard'); // Arahkan ke dashboard
      } else {
        toast.error('Email atau password salah');
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image - Tetap menggunakan image Anda */}
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': `url(${BgDashboard})`
        }}
      />

      {/* Gradient Overlay - Menggunakan warna dari gambar asli Anda */}
      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />

      {/* Floating Bubbles - Disesuaikan agar lebih menyatu dan visualnya lebih halus */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce" />
        <div class="absolute bottom-32 left-40 w-40 h-40 bg-pink-300/15 rounded-full blur-2xl animate-pulse" />
        <div class="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/20 rounded-full blur-xl animate-bounce" />
      </div>

      {/* Main Content */}
      <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          {/* Welcome Title */}
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p class="text-gray-600 text-lg">Masuk ke akun Anda</p>
          </div>

          {/* Glassmorphism Card - Perhatian pada `py-10` untuk menambah tinggi vertikal */}
          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl py-10 px-8 shadow-xl text-gray-800">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Login</h2>
            </div>

            <form onSubmit={handleSubmit} class="space-y-4"> {/* space-y-4 tetap konsisten */}
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData().email}
                  onInput={(e) => updateField('email', e.currentTarget.value)}
                  class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                />
              </div>

              {/* Password Input */}
              <div class="relative">
                <input
                  type={showPassword() ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData().password}
                  onInput={(e) => updateField('password', e.currentTarget.value)}
                  class="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword())}
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {showPassword() ? (
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  ) : (
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div class="text-right">
                <A
                  href="/forgot-password"
                  class="text-gray-600 hover:text-gray-800 text-sm hover:underline focus:outline-none focus:underline"
                >
                  Lupa Password?
                </A>
              </div>

              

              {/* Login Button - Menggunakan warna ungu spesifik dari kode hex */}
              <button
                type="submit"
                disabled={isLoading()}
                class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading() ? 'Masuk...' : 'Login'}
              </button>

              {/* Register Link */}
              <div class="text-center mt-6">
                <span class="text-gray-600">Belum punya akun? </span>
                <A
                  href="/register"
                  class="text-[#7F66CB] font-semibold hover:underline focus:outline-none focus:underline hover:text-[#6a54b3]"
                >
                  Register
                </A>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;