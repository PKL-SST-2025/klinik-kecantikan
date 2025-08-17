import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';
import BgDashboard from '.././icons/bglogin.png';
import api from '../api/api'; // Import instance API

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  const validateForm = () => {
    if (!password() || !confirmPassword()) {
      return 'Semua field harus diisi';
    }
    if (password() !== confirmPassword()) {
      return 'Password dan konfirmasi password tidak sama';
    }
    if (password().length < 6) {
      return 'Password minimal 6 karakter';
    }
    return '';
  };

  const getAccessTokenFromFragment = (fragment: string) => {
    if (!fragment) return null;
    const params = new URLSearchParams(fragment.substring(1));
    return params.get('access_token');
  };

  const handleApiError = (error: unknown) => {
    let errorMessage = 'Gagal terhubung ke server.';
    if (typeof error === 'object' && error !== null) {
      if ('response' in error && typeof (error as any).response?.data === 'string') {
        errorMessage = (error as any).response.data;
      } else if ('message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
    }
    toast.error(errorMessage);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const fragment = window.location.hash;

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const accessToken = getAccessTokenFromFragment(fragment);
    if (!accessToken) {
      toast.error('Tautan reset password tidak valid atau sudah kedaluwarsa.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/reset-password', { password: password() }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        toast.success('Password berhasil direset! Silakan login.');
        navigate('/login');
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
 
  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image */}
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': `url(${BgDashboard})`
        }}
      />

      {/* Gradient Overlay */}
      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />

      {/* Floating Bubbles */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce" />
        <div class="absolute bottom-32 left-40 w-40 h-40 bg-pink-300/15 rounded-full blur-2xl animate-pulse" />
        <div class="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/20 rounded-full blur-xl animate-bounce" />
      </div>

      {/* Main Content */}
      <div class="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-gray-700 mb-2">Reset Password</h1>
          <p class="text-gray-500 text-sm">Buat password baru untuk akun Anda</p>
        </div>

        {/* Form Card */}
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div class="mb-6">
            <h2 class="text-lg font-medium text-gray-700 mb-1">Password Baru</h2>
            <p class="text-xs text-gray-500 mb-4">Masukkan password baru Anda</p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-4">
            {/* Password Field */}
            <div class="relative">
              <input
                type={showPassword() ? "text" : "password"}
                placeholder="••••••••"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword())}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  {showPassword() ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Confirm Password Field */}
            <div class="relative">
              <input
                type={showConfirmPassword() ? "text" : "password"}
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                class="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  {showConfirmPassword() ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Password Requirements */}
            <div class="text-xs text-gray-500 space-y-1">
              <p class="flex items-center">
                <span class="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                Minimal 6 karakter
              </p>
              <p class="flex items-center">
                <span class="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                Password harus sama
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              {isLoading() ? 'Mereset...' : 'Reset Password'}
            </button>
          </form>

          {/* Footer Link */}
          <div class="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
};
export default ResetPassword;