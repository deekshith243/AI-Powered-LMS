'use client';

import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, User, Search, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function Navbar() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, [checkAuth, pathname]);

  // Handle click outside for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const res = await api.post('/ai/search', { query: searchTerm });
          setSearchResults(res.data.results);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.replace('/login');
  };

  if (!mounted) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold tracking-tight text-indigo-700">
              AI-Powered LMS
            </Link>
            {/* Removed Explore Catalog from here */}
          </div>
          
          {/* Desktop Right Nav & Search */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            
            {/* Semantic Search Box */}
            <div className="relative mr-4" ref={searchRef}>
               <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input 
                     type="text" 
                     placeholder="AI Search lessons..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-1.5 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-800"
                  />
                  {isSearching && <Loader2 className="absolute right-3 w-4 h-4 text-indigo-500 animate-spin" />}
               </div>
               
               {/* Search Dropdown Results */}
               {showDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2">
                     {searchResults.length > 0 ? (
                        searchResults.map(result => (
                           <Link 
                              key={result.id} 
                              href={`/learn/${result.subject_id}/${result.id}`}
                              onClick={() => setShowDropdown(false)}
                              className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                           >
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{result.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{result.subject_title}</p>
                           </Link>
                        ))
                     ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                           No lessons found.
                        </div>
                     )}
                  </div>
               )}
            </div>

            {isAuthenticated && (
              <Link href="/catalog">
                <button
                  className={`mr-2 px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-100 ${
                    pathname === '/catalog' ? 'ring-2 ring-indigo-300 ring-offset-2' : ''
                  }`}
                >
                  Explore Catalog
                </button>
              </Link>
            )}

            <button
              onClick={() => router.push("/placements")}
              className="mr-2 px-4 py-1.5 text-sm font-bold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition shadow-md shadow-purple-100"
            >
              Placements
            </button>

            {isAuthenticated && (
              <button
                onClick={() => router.push("/profile")}
                className="hidden md:flex items-center px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-100 mr-2"
              >
                Dashboard
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link href="/profile" className="flex items-center text-sm font-semibold text-gray-700 hover:text-indigo-600 transition">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition">
                  Login
                </Link>
                <Link href="/register" className="inline-flex items-center px-5 py-2 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 shadow-md">
          {isAuthenticated ? (
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                href="/subjects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-indigo-500"
              >
                Explore Catalog
              </Link>
              <Link 
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-indigo-500"
              >
                My Profile
              </Link>
              <Link 
                href="/placements"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-purple-500"
              >
                Placements
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link 
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
