import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Search, User as UserIcon, Sparkles, MessageSquare, FileText, LogOut, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/api/axios";
import { useSelector, useDispatch } from "react-redux";
import { selectuser, logout } from "@/Feature/Userslice";
import { auth } from "@/firebase/firebase";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectuser);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const updateLocalUser = () => {
      const storedUser = localStorage.getItem('app_user');
      if (storedUser) {
        try { setLocalUser(JSON.parse(storedUser)); } catch (e) {}
      }
    };

    updateLocalUser();

    window.addEventListener('app_user_update', updateLocalUser);
    return () => window.removeEventListener('app_user_update', updateLocalUser);
  }, [reduxUser]);
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;
      
      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            { pageLanguage: 'en', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
            'google_translate_element'
          );
        }
      };

      const script = document.createElement("script");
      script.id = 'google-translate-script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    // Small delay to ensure the div is rendered
    const timeoutId = setTimeout(addGoogleTranslateScript, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback: Set cookie and reload if Google script hasn't rendered select
      document.cookie = `googtrans=/en/${lang}; path=/`;
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {}
    try {
      await auth.signOut();
    } catch (e) {}
    localStorage.removeItem('app_user');
    dispatch(logout());
    setLocalUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };
  const activeUser = reduxUser || localUser;

  return (
    <div className="relative z-50">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-blue-600 text-white font-extrabold text-xl px-3 py-1 rounded-lg shadow-sm">
                  Intern<span className="text-blue-200">Area</span>
                </div>
              </Link>
            </div>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/internship" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                Internships
              </Link>
              <Link href="/job" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                Jobs
              </Link>
              <Link href="/community" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <MessageSquare size={16} />
                <span>Public Space</span>
              </Link>
              <Link href="/resume-builder" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                <FileText size={16} className="text-blue-600" />
                <span>Resume Builder (₹50)</span>
              </Link>
              <Link href="/pricing" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                <Sparkles size={16} className="text-amber-500" />
                <span>Plans</span>
              </Link>
              {activeUser && (
                <Link href="/applications" className="text-gray-700 hover:text-blue-600 font-medium text-sm transition">
                  My Applications
                </Link>
              )}
              {/* Language Translate Button */}
              <div className="relative flex items-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-200 transition-all shadow-sm h-[32px] w-[110px]">
                <Globe size={14} className="absolute left-3 text-blue-600 pointer-events-none" />
                <select 
                  onChange={handleLanguageChange}
                  className="w-full h-full bg-transparent text-xs font-semibold tracking-wide text-gray-700 outline-none appearance-none cursor-pointer pl-5 pr-2"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.2rem center', backgroundSize: '10px' }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh-CN">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              {/* Hidden Google Translate Element */}
              <div id="google_translate_element" className="w-0 h-0 overflow-hidden absolute pointer-events-none"></div>
            </div>

            {/* Auth Buttons / Profile */}
            <div className="flex items-center space-x-4">
              {activeUser ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" aria-label="Go to Profile" className="flex items-center gap-2 text-gray-800 hover:text-blue-600 font-semibold text-xs bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 transition">
                    <Image
                      src={activeUser.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"}
                      alt={`${activeUser.name || activeUser.username || 'User'}'s profile picture`}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="max-w-[120px] truncate">{activeUser.name || activeUser.username?.split('@')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    aria-label="Logout"
                    className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    <LogOut size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5">
                  <UserIcon size={14} />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
