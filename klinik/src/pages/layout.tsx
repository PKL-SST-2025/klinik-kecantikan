import { createSignal, createEffect, Show, For } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Search, Bell, User, LogOut, Settings, Menu, X, Home, Users, Calendar, UserCheck, Stethoscope, FileText, BarChart3, Package } from 'lucide-solid';
import { toast } from 'solid-toast';
import { JSX } from 'solid-js';

const Layout = (props: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarHovered, setSidebarHovered] = createSignal(false);
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [notifications] = createSignal([
    { id: 1, message: 'Appointment baru dari John Doe', time: '5 menit lalu', read: false },
    { id: 2, message: 'Pembayaran berhasil untuk treatment facial', time: '10 menit lalu', read: false },
    { id: 3, message: 'Reminder: Check-up rutin besok', time: '1 jam lalu', read: true },
  ]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = createSignal(false);

  // Check authentication on mount
  createEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      navigate('/login');
    }
  });

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', key: 'dashboard' },
    { icon: Users, label: 'Pasien', path: '/pasien', key: 'pasien' },
    { icon: Calendar, label: 'Jadwal', path: '/jadwal', key: 'jadwal' },
    { icon: UserCheck, label: 'Registrasi', path: '/registrasi', key: 'registrasi' },
    { icon: Stethoscope, label: 'Dokter', path: '/dokter', key: 'dokter' },
    { icon: FileText, label: 'Produk', path: '/produk', key: 'produk' },
    { icon: BarChart3, label: 'Statistik', path: '/statistik', key: 'statistik' },
    { icon: Package, label: 'Pembayaran', path: '/pembayaran', key: 'pembayaran' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    toast.success('Berhasil logout');
    navigate('/login');
  };

  const getUserEmail = () => {
    return localStorage.getItem('userEmail') || 'admin@klinik.com';
  };

  const unreadNotifications = () => notifications().filter(n => !n.read).length;

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Mobile Menu Overlay */}
      <Show when={mobileMenuOpen()}>
        <div 
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      </Show>

      {/* Sidebar */}
      <aside 
        class={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl z-50 transition-all duration-300 ${
          sidebarHovered() ? 'w-64' : 'w-16'
        } ${mobileMenuOpen() ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo */}
        <div class="p-4 border-b border-white/20">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope class="w-5 h-5 text-white" />
            </div>
            <Show when={sidebarHovered()}>
              <span class="font-bold text-gray-800 whitespace-nowrap">Klinik Cantik</span>
            </Show>
          </div>
        </div>

        {/* Navigation */}
        <nav class="p-4 space-y-2">
          <For each={menuItems}>
            {(item) => (
              <a
                href={item.path}
                class={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50 hover:text-purple-600'
                }`}
              >
                <item.icon class="w-5 h-5 flex-shrink-0" />
                <Show when={sidebarHovered()}>
                  <span class="whitespace-nowrap font-medium">{item.label}</span>
                </Show>
              </a>
            )}
          </For>
        </nav>
      </aside>

      {/* Main Content */}
      <div class={`transition-all duration-300 ${sidebarHovered() ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header */}
        <header class="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-30">
          <div class="px-4 py-4">
            <div class="flex items-center justify-between">
              {/* Left Section */}
              <div class="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
                  class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {mobileMenuOpen() ? <X class="w-5 h-5" /> : <Menu class="w-5 h-5" />}
                </button>

                {/* Search */}
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery()}
                    onInput={(e) => setSearchQuery(e.currentTarget.value)}
                    class="pl-10 pr-4 py-2 bg-gray-100/80 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-64 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div class="flex items-center space-x-4">
                {/* Notifications */}
                <div class="relative">
                  <button
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen())}
                    class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Bell class="w-5 h-5 text-gray-600" />
                    <Show when={unreadNotifications() > 0}>
                      <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications()}
                      </span>
                    </Show>
                  </button>

                  {/* Notification Dropdown */}
                  <Show when={notificationDropdownOpen()}>
                    <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div class="p-4 border-b border-gray-200">
                        <h3 class="font-semibold text-gray-800">Notifikasi</h3>
                      </div>
                      <div class="max-h-96 overflow-y-auto">
                        <For each={notifications()}>
                          {(notification) => (
                            <div class={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                              <p class="text-sm text-gray-800 mb-1">{notification.message}</p>
                              <p class="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          )}
                        </For>
                      </div>
                      <div class="p-3 border-t border-gray-200">
                        <button class="text-sm text-purple-600 hover:text-purple-700 font-medium">
                          Lihat semua notifikasi
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>

                {/* Profile */}
                <div class="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen())}
                    class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div class="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User class="w-4 h-4 text-white" />
                    </div>
                    <span class="hidden sm:block text-sm font-medium text-gray-700">
                      {getUserEmail().split('@')[0]}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <Show when={profileDropdownOpen()}>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div class="p-3 border-b border-gray-200">
                        <p class="text-sm font-medium text-gray-800">{getUserEmail().split('@')[0]}</p>
                        <p class="text-xs text-gray-500">{getUserEmail()}</p>
                      </div>
                      <div class="py-2">
                        <a
                          href="/profile"
                          class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Settings class="w-4 h-4" />
                          <span>Profile</span>
                        </a>
                        <button
                          onClick={handleLogout}
                          class="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut class="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main class="p-6">
          {props.children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      <div
        class="fixed inset-0 z-10"
        classList={{
          'pointer-events-none': !profileDropdownOpen() && !notificationDropdownOpen(),
          'pointer-events-auto': profileDropdownOpen() || notificationDropdownOpen()
        }}
        onClick={() => {
          setProfileDropdownOpen(false);
          setNotificationDropdownOpen(false);
        }}
      />
    </div>
  );
};

export default Layout;