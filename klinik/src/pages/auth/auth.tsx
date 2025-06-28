import { Component, JSXElement } from 'solid-js';

interface AuthLayoutProps {
  children: JSXElement;
}

const AuthLayout: Component<AuthLayoutProps> = (props) => {
  return (
    // Container utama dengan background image dari tailwind.config.js
    // dan efek glassmorphism transparan pada latar belakang keseluruhan jika diperlukan
    <div class="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 font-open-sans">
      {/* Kartu form dengan efek glassmorphism utama */}
      <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl text-center glass-effect">
        {props.children}
      </div>
    </div>
  );
};

export default AuthLayout;