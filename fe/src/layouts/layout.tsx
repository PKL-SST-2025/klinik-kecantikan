//src/layouts/Layout.tsx
import { createSignal, createEffect, Show, For } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Search, Bell, User, LogOut, Settings, Menu, X, Home, Users, Calendar, UserCheck, Stethoscope, FileText, BarChart3, Package } from 'lucide-solid';
import { toast } from 'solid-toast';
import { JSX } from 'solid-js';
import { notifications } from '../stores/notificationStores';
// Ensure this path is correct relative to where Layout.tsx is located
import BgDashboard from '../icons/bgdashboard.png'; 

const Layout = (props: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);
  const [sidebarExpanded, setSidebarExpanded] = createSignal(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
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
    { icon: UserCheck, label: 'Registrasi', path: '/registrasi', key: 'registrasi' },
    { icon: Calendar, label: 'Jadwal', path: '/jadwal', key: 'jadwal' },
    { icon: Users, label: 'Pasien', path: '/pasien', key: 'pasien' },
    { icon: Stethoscope, label: 'Dokter', path: '/dokter', key: 'dokter' },
    { icon: FileText, label: 'Produk', path: '/produk', key: 'produk' },
    { icon: Package, label: 'Pembayaran', path: '/pembayaran', key: 'pembayaran' },
    { icon: BarChart3, label: 'Statistik', path: '/statistik', key: 'statistik' },
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
    <div 
      class="min-h-screen bg-cover bg-center bg-no-repeat relative" 
      style={{ 'background-image': `url(${BgDashboard})` }}
    >
      {/* Mobile Menu Overlay */}
      <Show when={mobileMenuOpen()}>
        <div 
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      </Show>

      <div class="flex min-h-screen">
        {/* Desktop Sidebar - Collapsed by default */}
        <aside 
          class={`hidden lg:flex lg:flex-col bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 ${
            sidebarExpanded() ? 'lg:w-64' : 'lg:w-16'
          }`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* Logo */}
          <div class="p-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-[#7F66CB] rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope class="w-5 h-5 text-white" />
              </div>
              <Show when={sidebarExpanded()}>
                <span class="font-bold text-gray-800 whitespace-nowrap">
                  Glowwie Clinique
                </span>
              </Show>
            </div>
          </div>

          {/* Navigation */}
          <nav class="px-2 space-y-2 flex-1">
            <For each={menuItems}>
              {(item) => (
                <a
                  href={item.path}
                  class={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${location.pathname === item.path
                      ? 'bg-[#7F66CB] text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/70 hover:text-[#7F66CB]'
                    }
                  `}
                  title={!sidebarExpanded() ? item.label : undefined}
                >
                  <item.icon class="w-5 h-5 flex-shrink-0" />
                  <Show when={sidebarExpanded()}>
                    <span class="ml-3 whitespace-nowrap font-medium">
                      {item.label}
                    </span>
                  </Show>
                  
                  {/* Tooltip for collapsed state */}
                  <Show when={!sidebarExpanded()}>
                    <div class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  </Show>
                </a>
              )}
            </For>
          </nav>
        </aside>

        {/* Mobile Sidebar - Toggleable */}
        <aside 
          class={`
            lg:hidden fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-md shadow-lg z-50 transition-transform duration-300
            ${mobileMenuOpen() ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Logo */}
          <div class="p-4 border-b border-white/30">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-[#7F66CB] rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope class="w-5 h-5 text-white" />
              </div>
              <span class="font-bold text-gray-800 whitespace-nowrap">
                Clinique
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav class="p-4 space-y-2">
            <For each={menuItems}>
              {(item) => (
                <a
                  href={item.path}
                  class={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group 
                    ${location.pathname === item.path
                      ? 'bg-[#7F66CB] text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/50 hover:text-[#7F66CB]'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon class="w-5 h-5 flex-shrink-0" />
                  <span class="whitespace-nowrap font-medium">
                    {item.label}
                  </span>
                </a>
              )}
            </For>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div class="flex-1 flex flex-col">
          {/* Header - Semi Transparent */}
          <header class="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div class="px-4 py-4">
              <div class="flex items-center justify-between">
                {/* Left Section */}
                <div class="flex items-center space-x-4">
                  {/* Mobile Menu Button - only visible on small screens */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
                    class="lg:hidden p-2 rounded-lg hover:bg-white/40 transition-colors bg-white/20"
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
                      class="pl-10 pr-4 py-2 bg-white/40 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all w-64 backdrop-blur-sm placeholder-gray-600 text-gray-800"
                    />
                  </div>
                </div>

                {/* Right Section */}
                <div class="flex items-center space-x-4">
                  {/* Notifications */}
                  <div class="relative">
                    <button
                      onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen())}
                      class="relative p-2 rounded-lg hover:bg-white/40 transition-colors bg-white/20"
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
                <div class="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl z-50">
                  <div class="p-4 border-b font-semibold text-gray-700">Notifikasi</div>
                  <div class="max-h-80 overflow-y-auto divide-y">
                    <For each={notifications()}>
                      {(notif) => (
                        <div class={`p-3 ${notif.read ? 'bg-white' : 'bg-purple-50'}`}>
                          <p class="text-sm text-gray-800">{notif.message}</p>
                          <p class="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      )}
                    </For>
                    <Show when={notifications().length === 0}>
                      <div class="p-4 text-sm text-gray-500">Tidak ada notifikasi.</div>
                    </Show>
                  </div>
                </div>
              </Show>
            </div>

                  {/* Profile */}
                  <div class="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen())}
                      class="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/40 transition-colors bg-white/20"
                    >
                      <div class="w-8 h-8 bg-[#7F66CB] rounded-full flex items-center justify-center">
                        <User class="w-4 h-4 text-white" />
                      </div>
                      <span class="hidden sm:block text-sm font-medium text-gray-700">
                        {getUserEmail().split('@')[0]}
                      </span>
                    </button>

                    {/* Profile Dropdown */}
                    <Show when={profileDropdownOpen()}>
                      <div class="absolute right-0 mt-2 w-48 bg-white/95 rounded-lg shadow-xl border border-gray-200 z-50 backdrop-blur-md">
                        <div class="p-3 border-b border-gray-200">
                          <p class="text-sm font-medium text-gray-800">{getUserEmail().split('@')[0]}</p>
                          <p class="text-xs text-gray-500">{getUserEmail()}</p>
                        </div>
                        <div class="py-2">
                          
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
          <main class="p-6 flex-1">
            {props.children}
          </main>
        </div>
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