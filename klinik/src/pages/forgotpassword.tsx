import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [isEmailSent, setIsEmailSent] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!email()) {
      toast.error('Email harus diisi');
      return;
    }

    if (!email().includes('@')) {
      toast.error('Format email tidak valid');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
      toast.success('Link reset password telah dikirim ke email Anda');
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image - Konsisten dengan Register & Login */}
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': "url('src/foto/bglogin.png')"
        }}
      />
      
      {/* Gradient Overlay - Konsisten dengan Register & Login */}
      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />
      
      {/* Floating Bubbles - Konsisten dengan Register & Login */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce" />
        <div class="absolute bottom-32 left-40 w-40 h-40 bg-pink-300/15 rounded-full blur-2xl animate-pulse" />
        <div class="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/20 rounded-full blur-xl animate-bounce" />
      </div>

      {/* Main Content */}
      <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          {/* Welcome Title - Warna text-gray-800 seperti Register & Login */}
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              Lupa Password?
            </h1>
            <p class="text-gray-600 text-lg">
              {isEmailSent() 
                ? 'Link reset telah dikirim'
                : 'Masukkan email untuk reset password'
              }
            </p>
          </div>

          {/* Glassmorphism Card - Konsisten dengan Register & Login, dengan padding disesuaikan */}
          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl py-10 px-8 shadow-2xl text-gray-800">
            {!isEmailSent() ? (
              <>
                <div class="text-center mb-6">
                  <h2 class="text-2xl font-semibold text-gray-800 mb-2">Reset Password</h2> {/* Teks gelap */}
                  <p class="text-gray-700 text-sm"> {/* Teks gelap */}
                    Kami akan mengirimkan link reset password ke email Anda
                  </p>
                </div>

                <form onSubmit={handleSubmit} class="space-y-6">
                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      placeholder="Masukkan email Anda"
                      value={email()}
                      onInput={(e) => setEmail(e.currentTarget.value)}
                      class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
                    />
                  </div>

                  {/* Reset Button - Menggunakan warna ungu spesifik */}
                  <button
                    type="submit"
                    disabled={isLoading()}
                    class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] focus:outline-none focus:ring-2 focus:ring-[#7F66CB] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading() ? 'Mengirim...' : 'Reset Password'}
                  </button>

                  {/* Back to Login - Teks gelap dan link warna ungu */}
                  <div class="text-center">
                    <a 
                      href="/login" 
                      class="text-gray-600 hover:text-gray-800 text-sm hover:underline focus:outline-none focus:underline"
                    >
                      Kembali ke Login
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div class="text-center space-y-6">
                  {/* Success Icon */}
                  <div class="flex justify-center">
                    <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h2 class="text-2xl font-semibold text-gray-800 mb-2">Email Terkirim!</h2> {/* Teks gelap */}
                    <p class="text-gray-700 text-sm mb-4"> {/* Teks gelap */}
                      Kami telah mengirimkan link reset password ke <br />
                      <span class="font-semibold">{email()}</span>
                    </p>
                    <p class="text-gray-600 text-xs"> {/* Teks gelap */}
                      Periksa folder spam jika email tidak ditemukan di inbox
                    </p>
                  </div>

                  {/* Demo Link - Warna ungu spesifik */}
                  <div class="bg-gray-100 border border-gray-200 rounded-lg p-3">
                    <p class="text-gray-700 text-xs text-center mb-2">Demo Mode:</p>
                    <a 
                      href="/reset-password"
                      class="text-[#7F66CB] hover:text-[#6a54b3] text-sm hover:underline focus:outline-none focus:underline font-medium"
                    >
                      Klik disini untuk simulasi reset password
                    </a>
                  </div>

                  {/* Back to Login Button - Menggunakan warna ungu spesifik */}
                  <button
                    onClick={handleBackToLogin}
                    class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] focus:outline-none focus:ring-2 focus:ring-[#7F66CB] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 shadow-lg"
                  >
                    Kembali ke Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;