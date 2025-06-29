import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const data = formData();
    
    // Validasi form
    if (!data.email || !data.password || !data.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (!data.email.includes('@') || !data.email.includes('.')) {
      toast.error('Format email tidak valid');
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
      // 1. Ambil data user yang terdaftar dari localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // 2. Cari user berdasarkan email
      const userIndex = registeredUsers.findIndex((user: any) => user.email === data.email);
      
      if (userIndex === -1) {
        toast.error('Email tidak terdaftar di sistem');
        return;
      }

      // 3. Update password user (tanpa hashing)
      const updatedUser = {
        ...registeredUsers[userIndex],
        password: data.password // Simpan password plain text (hanya untuk demo)
      };

      // 4. Update daftar user
      const updatedUsers = [...registeredUsers];
      updatedUsers[userIndex] = updatedUser;

      // 5. Simpan kembali ke localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // 6. Jika user sedang login, force logout
      const currentUser = JSON.parse(localStorage.getItem('clinic_user') || 'null');
      if (currentUser && currentUser.email === data.email) {
        localStorage.removeItem('clinic_user');
        localStorage.removeItem('isAuthenticated');
      }

      toast.success('Password berhasil direset! Silakan login dengan password baru');
      navigate('/login');
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error('Terjadi kesalahan saat reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': "url('src/foto/bglogin.png')"
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
      <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          {/* Title Section */}
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              Reset Password
            </h1>
            <p class="text-gray-600 text-lg">Buat password baru untuk akun Anda</p>
          </div>

          {/* Form Card */}
          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl py-10 px-8 shadow-xl text-gray-800">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Password Baru</h2>
              <p class="text-gray-700 text-sm">
                Masukkan email dan password baru Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} class="space-y-4">
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData().email}
                  onInput={(e) => updateField('email', e.currentTarget.value)}
                  class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  required
                />
              </div>

              {/* New Password Input */}
              <div class="relative">
                <input
                  type={showPassword() ? 'text' : 'password'}
                  placeholder="Password Baru"
                  value={formData().password}
                  onInput={(e) => updateField('password', e.currentTarget.value)}
                  class="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  required
                  minlength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword())}
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showPassword() ? "Sembunyikan password" : "Tampilkan password"}
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

              {/* Confirm Password Input */}
              <div class="relative">
                <input
                  type={showConfirmPassword() ? 'text' : 'password'}
                  placeholder="Konfirmasi Password Baru"
                  value={formData().confirmPassword}
                  onInput={(e) => updateField('confirmPassword', e.currentTarget.value)}
                  class="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                  required
                  minlength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showConfirmPassword() ? "Sembunyikan password" : "Tampilkan password"}
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

              {/* Password Requirements */}
              <div class="bg-gray-100 border border-gray-200 rounded-lg p-3">
                <p class="text-gray-700 text-xs mb-1">Password harus:</p>
                <ul class="text-gray-600 text-xs space-y-1">
                  <li class="flex items-center">
                    <span class={`w-2 h-2 rounded-full mr-2 ${formData().password.length >= 6 ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                    Minimal 6 karakter
                  </li>
                  <li class="flex items-center">
                    <span class={`w-2 h-2 rounded-full mr-2 ${formData().password === formData().confirmPassword && formData().password.length > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                    Password harus sama
                  </li>
                </ul>
              </div>

              {/* Reset Button */}
              <button
                type="submit"
                disabled={isLoading()}
                class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7F66CB] focus:ring-offset-2 focus:ring-offset-transparent"
              >
                {isLoading() ? 'Mereset Password...' : 'Reset Password'}
              </button>

              {/* Back to Login Link */}
              <div class="text-center">
                <a 
                  href="/login" 
                  class="text-gray-600 hover:text-gray-800 text-sm hover:underline focus:outline-none focus:underline"
                >
                  Kembali ke Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;