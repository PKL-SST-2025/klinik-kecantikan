import { Component, createSignal } from 'solid-js';
import { Check, Heart, LogIn, Mail, Instagram, Facebook, Twitter, Users, BarChart3, Calendar, Shield, Star, Play, ArrowRight, Sparkles, Zap } from 'lucide-solid';

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

// Featured screenshots
const featuredScreenshots: Screenshot[] = [
  { name: 'DashboardPage1', title: 'Dashboard Analytics', description: 'Overview lengkap performa klinik dengan grafik real-time dan insights mendalam' },
  { name: 'DataPasienPage', title: 'Manajemen Pasien', description: 'Kelola data pasien dengan sistem yang terintegrasi dan user-friendly' },
  { name: 'JadwalPage', title: 'Jadwal & Appointment', description: 'Sistem booking online yang efisien untuk pasien dan dokter' },
  { name: 'StatistikPage1', title: 'Laporan Statistik', description: 'Insight mendalam untuk pengambilan keputusan bisnis yang tepat' },
  { name: 'invoicepage', title: 'Invoice & Billing', description: 'Sistem pembayaran otomatis dengan laporan keuangan detail' },
  { name: 'loginPage', title: 'Keamanan Login', description: 'Autentikasi aman dengan verifikasi berlapis dan enkripsi data' }
];

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 'Gratis',
    period: 'Selamanya',
    features: ['1 Admin User', 'Manajemen Pasien & Dokter', 'Basic Dashboard', 'Community Support', 'Data Export CSV'],
    popular: false
  },
  {
    name: 'Professional',
    price: 'Rp 149.000',
    period: '/bulan',
    features: ['5 Admin Users', 'Advanced Analytics', 'Export ke Excel/PDF', 'Appointment System', 'Email Support', 'Auto Backup', 'Custom Reports'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'Hubungi Sales',
    features: ['Unlimited Users', 'API Integration', 'Custom Features', 'Priority Support', 'Team Training', 'White Label', 'SLA 99.9%'],
    popular: false
  }
];

const features: Feature[] = [
  {
    icon: Users,
    title: 'Manajemen Komprehensif',
    description: 'Kelola seluruh aspek klinik dalam satu platform: pasien, dokter, staff, treatment, dan inventory dengan interface yang intuitif dan modern.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Business Intelligence',
    description: 'Dashboard real-time dengan visualisasi data canggih, laporan performa detail, dan business insights untuk optimalisasi revenue klinik.'
  },
  {
    icon: Calendar,
    title: 'Smart Appointment System',
    description: 'Sistem booking online otomatis dengan reminder WhatsApp/SMS, sinkronisasi kalender, dan manajemen antrian yang efisien.'
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Keamanan data tingkat enterprise dengan enkripsi end-to-end, backup otomatis, audit trail, dan compliance GDPR.'
  }
];

const LandingPage: Component = () => {
  const [activeTab, setActiveTab] = createSignal('monthly');
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 text-gray-700 font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav class="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles class="w-6 h-6 text-white" />
              </div>
              <div>
                <span class="text-xl font-bold text-purple-600">GlowwieClinique</span>
                <span class="text-xl font-light text-gray-700"> Pro</span>
              </div>
            </div>
            
            <div class="hidden md:flex items-center space-x-8">
              <a href="#fitur" class="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium">Fitur</a>
              <a href="#screenshot" class="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium">Demo</a>
              <a href="#harga" class="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium">Pricing</a>
              <a href="#kontak" class="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium">Kontak</a>
              <div class="flex items-center space-x-3">
                <a href="/login" class="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium">Masuk</a>
                <a href="/register" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full transition-all duration-200 transform hover:scale-105 font-medium shadow-lg">
                  Coba Gratis
                </a>
              </div>
            </div>

            {/* Mobile menu button */}
            <button 
              class="md:hidden text-gray-600 hover:text-purple-600"
              onClick={() => setIsMenuOpen(!isMenuOpen())}
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          <div class={`md:hidden transition-all duration-300 ${isMenuOpen() ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div class="py-4 space-y-4 border-t border-purple-100">
              <a href="#fitur" class="block text-gray-600 hover:text-purple-600 font-medium">Fitur</a>
              <a href="#screenshot" class="block text-gray-600 hover:text-purple-600 font-medium">Demo</a>
              <a href="#harga" class="block text-gray-600 hover:text-purple-600 font-medium">Pricing</a>
              <a href="#kontak" class="block text-gray-600 hover:text-purple-600 font-medium">Kontak</a>
              <a href="/login" class="block text-gray-600 hover:text-purple-600 font-medium">Masuk</a>
              <a href="/register" class="block bg-purple-600 text-white px-6 py-2.5 rounded-full text-center font-medium">
                Coba Gratis
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section class="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Background Pattern */}
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
          <div class="absolute top-40 right-10 w-72 h-72 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
          <div class="absolute bottom-20 left-20 w-72 h-72 bg-purple-100/40 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style="animation-delay: 4s;"></div>
        </div>
        
        <div class="relative z-10 max-w-6xl mx-auto text-center">
          <div class="mb-8">
            <span class="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-purple-200 rounded-full px-6 py-3 text-sm font-medium text-purple-700 shadow-md">
              <Zap class="w-4 h-4" />
              Platform Management Klinik #1 di Indonesia
            </span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span class="text-gray-800">Sistem Klinik</span>
            <br />
            <span class="text-purple-600">Kecantikan Modern</span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Platform management klinik kecantikan terdepan dengan interface yang elegan, analytics mendalam, dan sistem terintegrasi untuk mengoptimalkan operasional klinik Anda.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <a href="/register" class="group bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2">
              Mulai Gratis Sekarang
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <button class="group bg-white/90 backdrop-blur border border-purple-200 hover:border-purple-300 text-purple-700 px-8 py-4 text-lg rounded-full transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Play class="w-4 h-4 ml-0.5 text-purple-600" />
              </div>
              Tonton Demo
            </button>
          </div>
          
          {/* Stats */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="bg-white/80 backdrop-blur border border-purple-100 rounded-2xl p-6 shadow-lg">
              <div class="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div class="text-gray-600 font-medium">Klinik Terdaftar</div>
            </div>
            <div class="bg-white/80 backdrop-blur border border-purple-100 rounded-2xl p-6 shadow-lg">
              <div class="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div class="text-gray-600 font-medium">Pasien Dikelola</div>
            </div>
            <div class="bg-white/80 backdrop-blur border border-purple-100 rounded-2xl p-6 shadow-lg">
              <div class="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div class="text-gray-600 font-medium">Uptime Server</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" class="py-24 px-4 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20">
            <div class="mb-4">
              <span class="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700">
                <Star class="w-4 h-4" />
                Fitur Unggulan
              </span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Solusi Lengkap untuk
              <span class="text-purple-600"> Klinik Modern</span>
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Tingkatkan efisiensi operasional, kepuasan pasien, dan revenue klinik dengan fitur-fitur canggih yang dirancang khusus untuk industri kecantikan.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div class="group bg-gradient-to-br from-white to-purple-50 border border-purple-100 hover:border-purple-300 rounded-3xl p-8 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-600/20">
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <feature.icon class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-xl font-bold mb-4 text-gray-800 group-hover:text-purple-700 transition-colors">{feature.title}</h3>
                <p class="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshot" class="py-24 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20">
            <div class="mb-4">
              <span class="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
                <Play class="w-4 h-4" />
                Interface Demo
              </span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Interface yang
              <span class="text-purple-600"> Memukau</span>
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Desain modern dan user-friendly yang dirancang berdasarkan feedback dari ratusan klinik kecantikan di seluruh Indonesia.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredScreenshots.map((screenshot, index) => (
              <div class="group bg-white border border-purple-100 hover:border-purple-300 rounded-3xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-600/20">
                <div class="aspect-video bg-gradient-to-br from-purple-100 to-purple-50 relative overflow-hidden">
                  <img 
                    src={`/screenshoot/${screenshot.name}.png`} 
                    alt={screenshot.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border border-purple-200 rounded-lg">
                          <div class="text-center text-purple-600">
                            <div class="text-3xl mb-3">🖥️</div>
                            <div class="font-semibold">${screenshot.title}</div>
                            <div class="text-xs text-purple-500 mt-1">Live Preview</div>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div class="p-6">
                  <h3 class="text-lg font-bold mb-3 text-gray-800 group-hover:text-purple-700 transition-colors">{screenshot.title}</h3>
                  <p class="text-gray-600 text-sm leading-relaxed">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" class="py-24 px-4 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20">
            <div class="mb-4">
              <span class="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700">
                <Heart class="w-4 h-4" />
                Paket Berlangganan
              </span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Investasi Terbaik untuk
              <span class="text-purple-600"> Masa Depan Klinik</span>
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Pilih paket yang sesuai dengan skala dan kebutuhan klinik Anda. Mulai gratis, upgrade kapan saja.
            </p>
            
            <div class="flex items-center justify-center gap-4 mb-12">
              <button 
                class={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                  activeTab() === 'monthly' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                }`}
                onClick={() => setActiveTab('monthly')}
              >
                Bulanan
              </button>
              <button 
                class={`px-6 py-3 rounded-full transition-all duration-300 relative font-medium ${
                  activeTab() === 'yearly' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                }`}
                onClick={() => setActiveTab('yearly')}
              >
                Tahunan
                <span class="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div class={`relative bg-white border rounded-3xl p-8 transition-all duration-500 hover:transform hover:scale-105 ${
                plan.popular 
                  ? 'border-purple-300 shadow-2xl shadow-purple-600/30 ring-2 ring-purple-200' 
                  : 'border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-600/20'
              }`}>
                {plan.popular && (
                  <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div class="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Star class="w-4 h-4" />
                      Paling Populer
                    </div>
                  </div>
                )}
                
                <div class="text-center mb-8">
                  <h3 class="text-2xl font-bold mb-4 text-gray-800">{plan.name}</h3>
                  <div class="mb-2">
                    <span class={`text-4xl font-bold ${plan.popular ? 'text-purple-600' : 'text-gray-800'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span class="text-gray-500 ml-2">
                        {activeTab() === 'yearly' && plan.name === 'Professional' ? '/tahun' : plan.period}
                      </span>
                    )}
                  </div>
                  {activeTab() === 'yearly' && plan.name === 'Professional' && (
                    <div class="text-sm text-green-600 font-medium">
                      Hemat Rp 358.000/tahun
                    </div>
                  )}
                </div>
                
                <ul class="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li class="flex items-start gap-3">
                      <div class="bg-purple-600 rounded-full p-1 mt-0.5 flex-shrink-0">
                        <Check class="w-3 h-3 text-white" />
                      </div>
                      <span class="text-gray-600 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button class={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg transform hover:scale-105'
                    : 'bg-purple-100 border border-purple-200 text-purple-700 hover:bg-purple-200'
                }`}>
                  {plan.name === 'Enterprise' ? 'Hubungi Sales' : plan.name === 'Basic' ? 'Mulai Gratis' : 'Pilih Professional'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" class="py-24 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div class="max-w-4xl mx-auto text-center">
          <div class="mb-4">
            <span class="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
              <Mail class="w-4 h-4" />
              Hubungi Kami
            </span>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Siap Membantu
            <span class="text-purple-600"> 24/7</span>
          </h2>
          <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Tim expert kami siap membantu Anda mengoptimalkan klinik dengan solusi yang tepat. Konsultasi gratis untuk semua paket.
          </p>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <a href="mailto:hello@beautyclinicpro.com" 
               class="group bg-white border border-purple-100 hover:border-purple-300 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg shadow-sm">
              <Mail class="w-8 h-8 mx-auto text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-semibold text-gray-800 mb-1">Email</div>
              <div class="text-xs text-gray-500">Response 1 jam</div>
            </a>
            
            <a href="https://wa.me/628123456789" 
               class="group bg-white border border-purple-100 hover:border-green-300 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg shadow-sm">
              <div class="w-8 h-8 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span class="text-white text-sm font-bold">WA</span>
              </div>
              <div class="text-sm font-semibold text-gray-800 mb-1">WhatsApp</div>
              <div class="text-xs text-gray-500">Chat langsung</div>
            </a>
            
            <a href="#" class="group bg-white border border-purple-100 hover:border-pink-300 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg shadow-sm">
              <Instagram class="w-8 h-8 mx-auto text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-semibold text-gray-800 mb-1">Instagram</div>
              <div class="text-xs text-gray-500">@beautyclinicpro</div>
            </a>
            
            <a href="#" class="group bg-white border border-purple-100 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg shadow-sm">
              <Twitter class="w-8 h-8 mx-auto text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <div class="text-sm font-semibold text-gray-800 mb-1">Twitter</div>
              <div class="text-xs text-gray-500">Updates & Tips</div>
            </a>
          </div>

          {/* CTA Buttons */}
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/register" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg shadow-purple-600/30">
              Mulai Trial Gratis
            </a>
            <a href="https://calendly.com/beautyclinic-demo" class="bg-white border border-purple-200 hover:border-purple-300 text-purple-700 px-8 py-4 text-lg rounded-full transition-all duration-300 font-semibold shadow-sm">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section class="py-24 px-4 bg-white">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20">
            <div class="mb-4">
              <span class="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700">
                <Heart class="w-4 h-4" />
                Testimoni
              </span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Dipercaya oleh
              <span class="text-purple-600"> 500+ Klinik</span>
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-3xl p-8 shadow-lg">
              <div class="flex items-center gap-1 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star class="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p class="text-gray-700 mb-6 italic leading-relaxed">
                "BeautyClinic Pro mengubah cara kami mengelola klinik. Revenue naik 40% dalam 3 bulan pertama karena sistem appointment yang efisien dan analytics yang mendalam."
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">DR</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-800">Dr. Ratna Sari</div>
                  <div class="text-sm text-gray-500">Direktur, Glow Beauty Clinic</div>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-3xl p-8 shadow-lg">
              <div class="flex items-center gap-1 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star class="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p class="text-gray-700 mb-6 italic leading-relaxed">
                "Interface yang sangat user-friendly dan support team yang responsif. Staff kami langsung bisa menggunakan tanpa training yang rumit. Highly recommended!"
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">AS</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-800">Andi Setiawan</div>
                  <div class="text-sm text-gray-500">Owner, Miracle Aesthetic</div>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-3xl p-8 shadow-lg">
              <div class="flex items-center gap-1 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <Star class="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p class="text-gray-700 mb-6 italic leading-relaxed">
                "Fitur analytics dan reporting sangat membantu untuk decision making. Sekarang kami bisa track performa setiap treatment dan optimize strategi bisnis dengan data yang akurat."
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">LM</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-800">Lisa Maharani</div>
                  <div class="text-sm text-gray-500">Manager, Venus Beauty Center</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section class="py-24 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-20">
            <div class="mb-4">
              <span class="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
                ❓ FAQ
              </span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Pertanyaan
              <span class="text-purple-600"> yang Sering Diajukan</span>
            </h2>
          </div>

          <div class="space-y-6">
            <div class="bg-white border border-purple-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Apakah data klinik aman di platform ini?</h3>
              <p class="text-gray-600 leading-relaxed">Ya, kami menggunakan enkripsi tingkat enterprise dan backup otomatis harian. Data Anda disimpan di server cloud yang memenuhi standar keamanan internasional dengan sertifikasi ISO 27001.</p>
            </div>

            <div class="bg-white border border-purple-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Berapa lama waktu implementasi sistem ini?</h3>
              <p class="text-gray-600 leading-relaxed">Untuk paket Basic dan Professional, Anda bisa langsung mulai dalam hitungan menit. Untuk paket Enterprise dengan custom integration, biasanya membutuhkan 1-2 minggu dengan bantuan tim technical kami.</p>
            </div>

            <div class="bg-white border border-purple-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Apakah bisa integrasi dengan sistem yang sudah ada?</h3>
              <p class="text-gray-600 leading-relaxed">Tentu saja! Kami menyediakan API dan berbagai connector untuk integrasi dengan sistem POS, accounting software, dan tools lainnya yang sudah Anda gunakan.</p>
            </div>

            <div class="bg-white border border-purple-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Bagaimana sistem support dan training?</h3>
              <p class="text-gray-600 leading-relaxed">Kami menyediakan onboarding session gratis, dokumentasi lengkap, video tutorial, dan support 24/7 melalui chat, email, atau WhatsApp. Tim kami berbahasa Indonesia dan memahami kebutuhan klinik lokal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section class="py-24 px-4 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div class="absolute inset-0">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 text-gray-800">
            Siap Mentransformasi
            <span class="text-purple-600"> Klinik Anda?</span>
          </h2>
          <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Bergabunglah dengan 500+ klinik kecantikan yang sudah merasakan peningkatan efisiensi dan revenue dengan BeautyClinic Pro. Mulai trial gratis hari ini, tidak perlu kartu kredit.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <a href="/register" class="group bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 text-xl rounded-full transition-all duration-300 transform hover:scale-105 font-semibold shadow-2xl shadow-purple-600/30 flex items-center gap-3">
              Mulai Trial 30 Hari Gratis
              <ArrowRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <div class="text-center">
              <div class="text-sm text-gray-500 mb-1">Atau hubungi sales:</div>
              <a href="https://wa.me/628123456789" class="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                +62 812-3456-7899
              </a>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <Check class="w-4 h-4 text-green-500" />
              <span>No Setup Fee</span>
            </div>
            <div class="flex items-center gap-2">
              <Check class="w-4 h-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
            <div class="flex items-center gap-2">
              <Check class="w-4 h-4 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-gray-50 border-t border-purple-100">
        <div class="max-w-7xl mx-auto px-4 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div class="md:col-span-2">
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles class="w-6 h-6 text-white" />
                </div>
                <div>
                  <span class="text-xl font-bold text-purple-600">GlowwieClinique</span>
                  <span class="text-xl font-light text-gray-700"> Pro</span>
                </div>
              </div>
              <p class="text-gray-600 mb-4 max-w-md leading-relaxed">
                Platform management klinik kecantikan terdepan di Indonesia. Tingkatkan efisiensi, kepuasan pasien, dan revenue klinik Anda dengan teknologi terdepan.
              </p>
              <div class="flex items-center gap-4">
                <a href="#" class="text-gray-400 hover:text-purple-600 transition-colors">
                  <Instagram class="w-5 h-5" />
                </a>
                <a href="#" class="text-gray-400 hover:text-purple-600 transition-colors">
                  <Twitter class="w-5 h-5" />
                </a>
                <a href="#" class="text-gray-400 hover:text-purple-600 transition-colors">
                  <Facebook class="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 class="font-semibold text-gray-800 mb-4">Product</h3>
              <ul class="space-y-2">
                <li><a href="#fitur" class="text-gray-600 hover:text-purple-600 transition-colors">Features</a></li>
                <li><a href="#harga" class="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">API Docs</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 class="font-semibold text-gray-800 mb-4">Support</h3>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Help Center</a></li>
                <li><a href="#kontak" class="text-gray-600 hover:text-purple-600 transition-colors">Contact</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Training</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div class="border-t border-purple-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} GlowwieClinique Pro. All rights reserved.
            </p>
            <div class="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" class="hover:text-purple-600 transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-purple-600 transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-purple-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;