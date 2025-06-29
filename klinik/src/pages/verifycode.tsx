import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

const VerifyCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = createSignal(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = createSignal(false);
  const [timeLeft, setTimeLeft] = createSignal(300); // 5 minutes in seconds

  // Timer countdown
  createEffect(() => {
    if (timeLeft() > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code()];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !code()[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const verificationCode = code().join('');

    if (verificationCode.length !== 6) {
      toast.error('Masukkan kode verifikasi 6 digit');
      return;
    }

    // --- PENTING: Untuk aplikasi nyata, kode verifikasi ini harus divalidasi di backend.
    // Ini hanya simulasi.
    if (verificationCode !== '123456') { // Ganti dengan logika verifikasi kode asli Anda
      toast.error('Kode verifikasi salah');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Verifikasi berhasil!');
      // >>>>>> Ini adalah bagian yang memastikan navigasi ke /login <<<<<<
      navigate('/login'); 
    }, 1500);
  };

  const resendCode = () => {
    setTimeLeft(300); // Reset timer
    setCode(['', '', '', '', '', '']); // Clear code inputs
    toast.success('Kode verifikasi baru telah dikirim');
    // Di sini Anda bisa menambahkan logika untuk memicu pengiriman ulang kode dari backend
  };

  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image - Tetap menggunakan image Anda */}
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': "url('src/foto/bglogin.png')"
        }}
      />

      {/* Gradient Overlay - Menggunakan gradient yang sama dengan halaman Register */}
      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />

      {/* Floating Bubbles - Menggunakan bubbles yang sama dengan halaman Register */}
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
            <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Verifikasi Kode
            </h1>
            <p class="text-white/80 text-lg">Masukkan kode yang dikirim ke email Anda</p>
          </div>

          {/* Glassmorphism Card */}
          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Kode Verifikasi</h2> {/* Teks gelap */}
              <p class="text-gray-700 text-sm"> {/* Teks gelap */}
                Kode akan kedaluwarsa dalam {formatTime(timeLeft())}
              </p>
            </div>

            <form onSubmit={handleSubmit} class="space-y-6">
              {/* Code Input Fields */}
              <div class="flex justify-center space-x-3">
                {code().map((digit, index) => (
                  <input
                    type="text"
                    maxLength="1"
                    data-index={index}
                    value={digit}
                    onInput={(e) => handleInputChange(index, e.currentTarget.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    class="w-12 h-12 text-center text-xl font-bold
                           bg-white/80 border border-gray-300 rounded-xl
                           text-gray-800 placeholder-gray-400 focus:outline-none
                           focus:ring-2 focus:ring-[#7F66CB] focus:border-transparent
                           backdrop-blur-sm transition-colors duration-200"
                    inputmode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>

              {/* Hint for Demo */}
              <div class="text-center mt-2">
                <p class="text-gray-600 text-sm"> {/* Teks gelap */}
                  Hint: Gunakan kode <span class="font-mono font-bold">123456</span> untuk demo
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading() || code().join('').length !== 6}
                class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl
                       hover:bg-[#6a54b3] focus:outline-none focus:ring-2 focus:ring-[#7F66CB]
                       focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading() ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              {/* Resend Code Section */}
              <div class="text-center mt-4">
                {timeLeft() === 0 ? (
                  <button
                    type="button"
                    onClick={resendCode}
                    class="text-[#7F66CB] font-semibold hover:underline focus:outline-none focus:underline hover:text-[#6a54b3]"
                  >
                    Kirim Ulang Kode
                  </button>
                ) : (
                  <span class="text-gray-600 text-sm"> 
                    Kirim ulang dalam {formatTime(timeLeft())}
                  </span>
                )}
              </div>

              {/* Back to Register Link */}
              <div class="text-center mt-4">
                <a
                  href="/register"
                  class="text-gray-600 hover:text-gray-800 text-sm hover:underline focus:outline-none focus:underline" 
                >
                  Kembali ke Register
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;