import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { toast } from 'solid-toast';
import BgDashboard from '.././icons/bglogin.png';
import { RegisterFormData } from '../types/user'; 
import api from '../api/api'; // Menggunakan instance API terpusat

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal<RegisterFormData>({
    name: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const data = formData();

    if (!data.name || !data.position || !data.email || !data.password || !data.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama');
      return;
    }

    if (data.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);

    try {
      // Mengganti fetch dengan axios (instance 'api')
      const response = await api.post('/register', {
        name: data.name,
        position: data.position,
        email: data.email,
        password: data.password,
      });

      if (response.status === 200) {
        setIsRegistrationSuccess(true);
        toast.success('Registrasi berhasil! Silakan verifikasi email Anda');
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      let errorMessage = 'Terjadi kesalahan saat registrasi.';
      if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: string }, message?: string };
        errorMessage = err.response?.data || err.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword());
  };

  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': `url(${BgDashboard})`
        }}
      />

      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />

      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce" />
        <div class="absolute bottom-32 left-40 w-40 h-40 bg-pink-300/15 rounded-full blur-2xl animate-pulse" />
        <div class="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/20 rounded-full blur-xl animate-bounce" />
      </div>

      <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              {isRegistrationSuccess() ? 'Registrasi Berhasil!' : 'Welcome!'}
            </h1>
            <p class="text-gray-600 text-lg">
              {isRegistrationSuccess() 
                ? 'Email verifikasi telah dikirim' 
                : 'Buat akun baru untuk memulai'
              }
            </p>
          </div>

          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl p-8 shadow-xl text-gray-800">
            {!isRegistrationSuccess() ? (
              <>
                <div class="text-center mb-6">
                  <h2 class="text-2xl font-semibold text-gray-800 mb-2">Let's Register</h2>
                </div>

                <form onSubmit={handleSubmit} class="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={formData().name}
                    onInput={(e) => updateField('name', e.currentTarget.value)}
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  />

                  <select
                    value={formData().position}
                    onChange={(e) => updateField('position', e.currentTarget.value as 'admin' | 'resepsionis' | 'dokter' | '')}
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  >
                    <option value="" disabled selected>Pilih Posisi</option>
                    <option value="admin">Admin</option>
                    <option value="resepsionis">Resepsionis</option>
                    <option value="dokter">Dokter</option>
                  </select>

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData().email}
                    onInput={(e) => updateField('email', e.currentTarget.value)}
                    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  />

                  {/* Password field with visibility toggle */}
                  <div class="relative">
                    <input
                      type={showPassword() ? "text" : "password"}
                      placeholder="Password"
                      value={formData().password}
                      onInput={(e) => updateField('password', e.currentTarget.value)}
                      class="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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

                  {/* Confirm Password field with visibility toggle */}
                  <div class="relative">
                    <input
                      type={showConfirmPassword() ? "text" : "password"}
                      placeholder="Konfirmasi Password"
                      value={formData().confirmPassword}
                      onInput={(e) => updateField('confirmPassword', e.currentTarget.value)}
                      class="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword() ? (
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

                  <button
                    type="submit"
                    disabled={isLoading()}
                    class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading() ? 'Mendaftar...' : 'Register'}
                  </button>

                  <div class="text-center mt-6">
                    <span class="text-gray-600">Sudah punya akun? </span>
                    <A
                      href="/login"
                      class="text-[#7F66CB] font-semibold hover:underline focus:outline-none focus:underline hover:text-[#6a54b3]"
                    >
                      Login
                    </A>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Success State - Email Verification Sent */}
                <div class="text-center space-y-6">
                  <div class="flex justify-center">
                    <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h2 class="text-2xl font-semibold text-gray-800 mb-2">Email Verifikasi Terkirim!</h2>
                    <p class="text-gray-700 text-sm mb-4">
                      Kami telah mengirimkan link verifikasi ke <br />
                      <span class="font-semibold">{formData().email}</span>
                    </p>
                    <p class="text-gray-600 text-xs mb-4">
                      Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun
                    </p>
                    <p class="text-gray-500 text-xs">
                      Periksa folder spam jika email tidak ditemukan di inbox
                    </p>
                  </div>

                  <button
                    onClick={handleBackToLogin}
                    class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] focus:outline-none focus:ring-2 focus:ring-[#7F66CB] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 shadow-lg"
                  >
                    Kembali ke Login
                  </button>

                  <div class="text-center">
                    <button
                      onClick={() => setIsRegistrationSuccess(false)}
                      class="text-gray-600 hover:text-gray-800 text-sm hover:underline focus:outline-none focus:underline"
                    >
                      Belum menerima email? Daftar ulang
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;