import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { toast } from 'solid-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    name: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = createSignal(false);

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

    // --- Logika Penyimpanan Data Registrasi ke localStorage ---
    try {
      let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Periksa apakah email sudah terdaftar
      const isEmailRegistered = registeredUsers.some((user: any) => user.email === data.email);
      if (isEmailRegistered) {
        toast.error('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
        setIsLoading(false);
        return;
      }

      // Simpan data user baru (catatan: password disimpan plain-text untuk demo, tidak disarankan di produksi)
      const newUser = {
        name: data.name,
        position: data.position,
        email: data.email,
        password: data.password // Di aplikasi nyata, hash password sebelum menyimpan!
      };
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      toast.success('Registrasi berhasil! Silakan verifikasi kode yang dikirim');
      navigate('/verify-code'); // Arahkan ke halaman verifikasi kode
    } catch (error) {
      console.error("Error saving registration data:", error);
      toast.error('Terjadi kesalahan saat registrasi.');
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
          'background-image': "url('src/foto/bglogin.png')"
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
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome!</h1>
            <p class="text-gray-600 text-lg">Buat akun baru untuk memulai</p>
          </div>

          {/* Card - Diatur untuk lebih transparan dan blur, mendekati gambar */}
          <div class="backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl p-8 shadow-xl text-gray-800">
            <div class="text-center mb-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Let’s Register</h2>
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
                onChange={(e) => updateField('position', e.currentTarget.value)}
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

              <input
                type="password"
                placeholder="Password"
                value={formData().password}
                onInput={(e) => updateField('password', e.currentTarget.value)}
                class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
              />

              <input
                type="password"
                placeholder="Konfirmasi Password"
                value={formData().confirmPassword}
                onInput={(e) => updateField('confirmPassword', e.currentTarget.value)}
                class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7F66CB]"
              />

              <button
                type="submit"
                disabled={isLoading()}
                class="w-full py-3 bg-[#7F66CB] text-white font-semibold rounded-xl hover:bg-[#6a54b3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading() ? 'Mendaftar...' : 'Register'}
              </button>

              <div class="text-center mt-6">
                <span class="text-gray-600">Sudah punya akun? </span>
                <a
                  href="/login"
                  class="text-[#7F66CB] font-semibold hover:underline focus:outline-none focus:underline hover:text-[#6a54b3]"
                >
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;