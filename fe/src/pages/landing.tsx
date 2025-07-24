import { Component } from 'solid-js';
import { Check, Heart, LogIn, Mail, Instagram, Facebook, Twitter, Users, BarChart3, Calendar, Shield, Star } from 'lucide-solid';

interface Screenshot {
  name: string;
  title: string;
  description: string;
}

interface Plan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
}

interface Feature {
  icon: any;
  title: string;
  description: string;
}

// Featured screenshots - hanya menampilkan yang penting dan menjelaskan fitur
const featuredScreenshots: Screenshot[] = [
  { name: 'DashboardPage1', title: 'Dashboard Analytics', description: 'Overview lengkap performa klinik dengan grafik real-time' },
  { name: 'DataPasienPage', title: 'Manajemen Pasien', description: 'Kelola data pasien dengan sistem yang terintegrasi' },
  { name: 'JadwalPage', title: 'Jadwal & Appointment', description: 'Sistem booking online untuk pasien dan dokter' },
  { name: 'StatistikPage1', title: 'Laporan Statistik', description: 'Insight mendalam untuk pengambilan keputusan bisnis' },
  { name: 'invoicepage', title: 'Invoice & Billing', description: 'Sistem pembayaran otomatis dan laporan keuangan' },
  { name: 'loginPage', title: 'Keamanan Login', description: 'Autentikasi aman dengan verifikasi berlapis' }
];

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 'Gratis',
    period: 'Selamanya',
    features: ['1 Admin', 'Manajemen Pasien & Dokter', 'Basic Dashboard', 'Support Community'],
    popular: false
  },
  {
    name: 'Pro',
    price: 'Rp99.000',
    period: '/bulan',
    features: ['3 Admin', 'Statistik Lengkap', 'Export Data', 'Appointment System', 'Support Email', 'Backup Otomatis'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Hubungi Kami',
    features: ['Unlimited Admin', 'Integrasi Sistem', 'Custom Features', 'Support Prioritas', 'Training Team', 'White Label'],
    popular: false
  }
];

const features: Feature[] = [
  {
    icon: Users,
    title: 'Manajemen Komprehensif',
    description: 'Kelola data pasien, dokter, staff, dan produk dalam satu sistem terintegrasi dengan interface yang intuitif'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Dashboard dengan grafik real-time, laporan performa, dan insight bisnis untuk optimalisasi operasional klinik'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Sistem appointment online dengan notifikasi otomatis, pengingat jadwal, dan sinkronisasi kalender'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Keamanan data tingkat enterprise dengan enkripsi, backup otomatis, dan audit trail untuk compliance'
  }
];

const LandingPage: Component = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 text-slate-600 font-sans">
      
      {/* Hero Section with Soft Background */}
      <section class="relative text-center py-32 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Soft Background Pattern */}
        <div class="absolute inset-0 opacity-30">
          <div class="absolute top-10 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
          <div class="absolute top-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
          <div class="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style="animation-delay: 4s;"></div>
        </div>
        
        {/* Glassmorphism Container */}
        <div class="relative bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl mx-4 md:mx-auto max-w-4xl py-16 px-8 shadow-lg z-10">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 text-purple-600">
            Sistem Klinik Kecantikan
          </h1>
          <p class="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-slate-500 leading-relaxed">
            Platform manajemen klinik modern dengan desain elegant, fitur lengkap, dan teknologi terdepan untuk mengoptimalkan operasional klinik Anda ✨
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/register" class="inline-block bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-slate-600 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold cursor-pointer text-center">
              Coba Gratis
            </a>
            <button class="bg-white/40 backdrop-blur-md border border-white/30 text-slate-600 px-8 py-4 text-lg rounded-full hover:bg-white/50 transition-all duration-300 font-semibold cursor-pointer">
              Lihat Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section with Background */}
      <section 
        id="fitur" 
        class="py-24 px-4 md:px-12 relative"
        style={{
          'background-image': 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
        }}
      >
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Fitur Unggulan</h2>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto">
              Solusi komprehensif untuk meningkatkan efisiensi dan kualitas pelayanan klinik kecantikan Anda
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div class="group bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl hover:bg-white/50 transition-all duration-500 hover:transform hover:scale-105">
                <div class="p-8 text-center h-full flex flex-col">
                  <div class="bg-gradient-to-br from-violet-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon class="w-8 h-8 text-violet" />
                  </div>
                  <h3 class="text-xl font-bold mb-4 text-slate-800">{feature.title}</h3>
                  <p class="text-sm text-slate-600 leading-relaxed flex-grow">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section class="py-24 px-4 md:px-12 bg-gradient-to-br from-white/50 to-violet-50/50 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Tampilan Aplikasi</h2>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto">
              Interface modern dan user-friendly yang dirancang khusus untuk kemudahan penggunaan
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredScreenshots.map((screenshot) => (
              <div class="group bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105">
                <div class="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden">
                  <img 
                    src={`/screenshoot/${screenshot.name}.png`} 
                    alt={screenshot.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback jika gambar tidak ditemukan
                      const target = e.target as HTMLImageElement;
                      target.src = '/screenshoot/placeholder.png';
                      // Atau bisa menggunakan gradient sebagai fallback
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center">
                          <div class="text-center text-violet-600">
                            <div class="text-2xl mb-2">📱</div>
                            <div class="text-sm font-medium">${screenshot.title}</div>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div class="p-6">
                  <h3 class="text-lg font-bold mb-2 text-slate-800">{screenshot.title}</h3>
                  <p class="text-sm text-slate-600">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Background */}
      <section 
        id="harga" 
        class="py-24 px-4 md:px-12 relative"
        style={{
          'background-image': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
        }}
      >
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Paket Berlangganan</h2>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhan dan skala klinik Anda
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div class={`relative bg-white/50 backdrop-blur-xl border shadow-xl rounded-3xl text-center transition-all duration-500 hover:transform hover:scale-105 ${
                plan.popular 
                  ? 'border-violet-300 bg-white/60 ring-4 ring-violet-200' 
                  : 'border-white/30 hover:bg-white/60'
              }`}>
                {plan.popular && (
                  <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div class="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star class="w-4 h-4" />
                      Paling Populer
                    </div>
                  </div>
                )}
                
                <div class="p-8">
                  <h3 class="text-2xl font-bold mb-2 text-slate-800">{plan.name}</h3>
                  <div class="mb-6">
                    <span class="text-3xl font-bold text-violet-600">{plan.price}</span>
                    {plan.period && <span class="text-slate-500 ml-1">{plan.period}</span>}
                  </div>
                  
                  <ul class="text-left mb-8 space-y-3">
                    {plan.features.map(feature => (
                      <li class="flex items-start gap-3">
                        <div class="bg-violet-100 rounded-full p-1 mt-0.5">
                          <Check class="w-3 h-3 text-violet-600" />
                        </div>
                        <span class="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button class={`w-full py-3 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg'
                      : 'bg-white/60 backdrop-blur-md border border-violet-200 text-violet-700 hover:bg-violet-50'
                  }`}>
                    {plan.name === 'Enterprise' ? 'Hubungi Sales' : 'Mulai Sekarang'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" class="py-20 bg-gradient-to-br from-white/30 to-violet-50/30 backdrop-blur-sm border-t border-white/20">
        <div class="max-w-4xl mx-auto text-center px-4">
          <h2 class="text-3xl font-bold mb-4 text-slate-800">Hubungi Kami</h2>
          <p class="mb-8 text-lg text-slate-600">
            Tim support kami siap membantu Anda 24/7 untuk konsultasi dan kerja sama
          </p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <a href="mailto:admin@klinikkecantikan.com" 
               class="group bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105">
              <Mail class="w-8 h-8 mx-auto text-violet-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-medium text-slate-700">Email</div>
            </a>
            
            <a href="#" class="group bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105">
              <Instagram class="w-8 h-8 mx-auto text-violet-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-medium text-slate-700">Instagram</div>
            </a>
            
            <a href="#" class="group bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105">
              <Facebook class="w-8 h-8 mx-auto text-violet-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-medium text-slate-700">Facebook</div>
            </a>
            
            <a href="#" class="group bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105">
              <Twitter class="w-8 h-8 mx-auto text-violet-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-medium text-slate-700">Twitter</div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="text-center py-8 bg-white/20 backdrop-blur-xl border-t border-white/30">
        <div class="max-w-4xl mx-auto px-4">
          <p class="text-sm text-slate-600 mb-2">
            &copy; {new Date().getFullYear()} Klinik Kecantikan - Platform Manajemen Klinik Terdepan
          </p>
          <p class="text-xs text-slate-500">
            Dibuat dengan ❤️ oleh Intan Amelia | Semua hak cipta dilindungi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;