import React, { useState } from 'react';
import { ShoppingCart, Search, User, Menu, X, Check, Shield } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenSearch: () => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItems,
  onOpenCart,
  onOpenSearch,
  userName,
  onUpdateUserName,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Vehicles', href: '#vehicles' },
    { label: 'Space', href: '#space' },
    { label: 'Internet', href: '#internet' },
    { label: 'AI', href: '#ai' },
    { label: 'Energy', href: '#energy' },
    { label: 'Robots', href: '#robots' },
    { label: 'Future', href: '#future' },
    { label: 'Empire & Statements', href: '#statements' },
    { label: 'Investments', href: '#investments' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setUserDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-md border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <a
          href="#"
          className="text-white font-extrabold text-base sm:text-lg tracking-[0.25em] uppercase whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          ELONVERSE
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-xs font-medium text-neutral-300">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className={`transition-colors whitespace-nowrap py-1 ${
                  isActive
                    ? 'text-white border-b-2 border-white font-semibold'
                    : 'hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            title="Search Products & Technologies (Cmd+K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Icon with Counter */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            title="View Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Guest Profile Menu (No Login Required) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
              title="Guest Profile (No Login Required)"
            >
              <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-200">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs truncate max-w-[100px] text-neutral-300">
                {userName}
              </span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0e0e0e] border border-neutral-800 shadow-2xl p-4 z-50">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white">Instant Guest Mode</p>
                    <p className="text-[10px] text-neutral-400">No email or password login required</p>
                  </div>
                </div>

                <form onSubmit={handleSaveName} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Display Name on Orders &amp; Chat
                    </label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="e.g. Alex or Explorer"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                      maxLength={24}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Name</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Chat Elon Direct Button */}
          <a
            href="/chat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(29,155,240,0.4)] whitespace-nowrap"
          >
            <span>🚀 Chat Elon</span>
          </a>

          {/* Shop All Button */}
          <a
            href="#vehicles"
            onClick={(e) => handleScrollTo(e, '#vehicles')}
            className="hidden md:inline-flex items-center px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 transition-colors whitespace-nowrap"
          >
            Shop All
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-neutral-800 bg-[#050505]/95 backdrop-blur-xl px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-800">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Guest: {userName}</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCart();
              }}
              className="text-xs font-medium text-white bg-neutral-800 px-3 py-1.5 rounded-lg"
            >
              View Cart ({totalQuantity})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
