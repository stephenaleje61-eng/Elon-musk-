import React, { useState } from 'react';
import { ShoppingCart, Heart, Bell, Search, User, Menu, X, Shield, ExternalLink, Check, Trash2, ArrowRight } from 'lucide-react';
import { CartItem, WishlistItem, MarketplaceNotification } from '../types';

interface MarketplaceNavbarProps {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  notifications: MarketplaceNotification[];
  userName: string;
  userEmail: string;
  onUpdateUser: (name: string, email: string) => void;
  onOpenCartDrawer: () => void;
  onOpenWishlistDrawer: () => void;
  onOpenSearchModal: () => void;
  onNavigateAdmin: () => void;
  onOpenMessageSupport: (topic?: string) => void;
  onMarkNotificationsRead: () => void;
}

export const MarketplaceNavbar: React.FC<MarketplaceNavbarProps> = ({
  cartItems,
  wishlistItems,
  notifications,
  userName,
  userEmail,
  onUpdateUser,
  onOpenCartDrawer,
  onOpenWishlistDrawer,
  onOpenSearchModal,
  onNavigateAdmin,
  onOpenMessageSupport,
  onMarkNotificationsRead,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Edit user state
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalWishlistCount = wishlistItems.length;
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: 'Vehicles', href: '#vehicles' },
    { label: 'Energy & Tech', href: '#energy' },
    { label: 'SpaceX', href: '#space' },
    { label: 'Starlink', href: '#internet' },
    { label: 'xAI Grok', href: '#ai' },
    { label: 'Optimus', href: '#robots' },
    { label: 'Future Projects', href: '#future' },
    { label: 'Investments', href: '#investments' },
    { label: 'News & Community', href: '#community' },
  ];

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onUpdateUser(editName.trim(), editEmail.trim());
      setUserModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050A14]/90 backdrop-blur-md border-b border-[#1A2A4A] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2.5 text-white font-extrabold text-base tracking-[0.2em] uppercase whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#1E88E5] p-[1.5px] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-full bg-[#050A14] flex items-center justify-center">
                <span className="text-[12px] font-black text-[#00F0FF]">X</span>
              </div>
            </div>
            <span className="text-white font-bold tracking-wider">ELON MUSK SPACE</span>
          </a>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#AAB7CC]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#00F0FF] transition-colors whitespace-nowrap py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions Cluster (Search, Wishlist, Cart, Notifications, User, Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearchModal}
            className="p-2 text-[#AAB7CC] hover:text-[#00F0FF] rounded-lg hover:bg-[#0A152A] transition-colors"
            title="Search Technology Catalog"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist Button with Badge */}
          <button
            onClick={onOpenWishlistDrawer}
            className="relative p-2 text-[#AAB7CC] hover:text-rose-400 rounded-lg hover:bg-[#0A152A] transition-colors"
            title="View Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {totalWishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {totalWishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button with Badge */}
          <button
            onClick={onOpenCartDrawer}
            className="relative p-2 text-[#AAB7CC] hover:text-[#00F0FF] rounded-lg hover:bg-[#0A152A] transition-colors"
            title="View Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00F0FF] text-[#050A14] text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) onMarkNotificationsRead();
              }}
              className="relative p-2 text-[#AAB7CC] hover:text-[#00F0FF] rounded-lg hover:bg-[#0A152A] transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0A152A] border border-[#1A2A4A] shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1A2A4A]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] text-[#AAB7CC]">{notifications.length} Updates</span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#00F0FF] mb-1 font-mono">
                        <span>{n.title}</span>
                        <span className="text-[#AAB7CC]">{n.timestamp}</span>
                      </div>
                      <p className="text-[#AAB7CC] text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Button */}
          <button
            onClick={() => setUserModalOpen(true)}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#0A152A] border border-[#1A2A4A] text-xs text-[#AAB7CC] hover:text-white transition-colors"
            title="User Account & Preferences"
          >
            <User className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="hidden sm:inline max-w-[80px] truncate">{userName}</span>
          </button>

          {/* Admin Portal Link */}
          <button
            onClick={onNavigateAdmin}
            className="hidden md:inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-[11px] font-mono text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
          >
            <Shield className="w-3 h-3 text-[#00F0FF]" />
            <span>Admin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#0A152A]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#050A14] border-b border-[#1A2A4A] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-[#AAB7CC] hover:text-[#00F0FF] font-medium"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[#1A2A4A] flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="text-[#00F0FF] font-mono"
            >
              Admin Control Portal &rarr;
            </button>
          </div>
        </div>
      )}

      {/* User Account Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl">
            <button
              onClick={() => setUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#00F0FF]" />
              <h3 className="text-base font-bold text-white">Visitor Account Settings</h3>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">Your Name / Callsign</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
