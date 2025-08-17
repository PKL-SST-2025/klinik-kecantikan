// src/components/VerifyCode.tsx

import { A } from '@solidjs/router';
import BgDashboard from '.././icons/bglogin.png';

const VerifyCode = () => {
  return (
    <div class="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background and Gradients */}
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          'background-image': `url(${BgDashboard})`
        }}
      />
      <div class="absolute inset-0 bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-300/40" />

      {/* Main Content */}
      <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Verifikasi Berhasil
            </h1>
            <p class="text-white/80 text-lg">
              Email Anda telah berhasil diverifikasi.
            </p>
          </div>

          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div class="text-center mb-6">
              <p class="text-gray-800 text-lg">
                Sekarang Anda bisa masuk ke akun Anda.
              </p>
            </div>

            <div class="text-center mt-6">
              <A
                href="/login"
                class="w-full inline-block py-3 px-6 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] transition-all duration-200 shadow-lg"
              >
                Kembali ke Login
              </A>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;