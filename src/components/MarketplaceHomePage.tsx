import React, { useState, useEffect } from 'react';
import { MarketplaceNavbar } from './MarketplaceNavbar';
import { MarketplaceHeroBanner } from './MarketplaceHeroBanner';
import { TeslaVehiclesSection } from './TeslaVehiclesSection';
import { TeslaEnergySection } from './TeslaEnergySection';
import { SpaceXSection } from './SpaceXSection';
import { StarlinkSection } from './StarlinkSection';
import { GrokAISection } from './GrokAISection';
import { OptimusAndXSection } from './OptimusAndXSection';
import { FutureProjectsSection } from './FutureProjectsSection';
import { ExpralInvestmentSection } from './ExpralInvestmentSection';
import { TechNewsAndCommunitySection } from './TechNewsAndCommunitySection';
import { DedicatedChatSection } from './DedicatedChatSection';
import { CartAndCheckoutSection } from './CartAndCheckoutSection';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { TechnologySearchModal } from './TechnologySearchModal';
import { Footer } from './Footer';
import {
  CartItem,
  WishlistItem,
  MarketplaceNotification,
  Vehicle,
  EnergyProduct,
  SpaceProduct,
  StarlinkProduct,
  GrokTier,
  ExpralInvestmentPlan,
} from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/elonverseData';

interface MarketplaceHomePageProps {
  visitorId: string;
  userName: string;
  userEmail: string;
  onUpdateUser: (name: string, email: string) => void;
  onNavigateAdmin: () => void;
}

export const MarketplaceHomePage: React.FC<MarketplaceHomePageProps> = ({
  visitorId,
  userName,
  userEmail,
  onUpdateUser,
  onNavigateAdmin,
}) => {
  // Cart State (Persisted to localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elon_musk_space_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial pre-filled showcase items
    return [
      {
        id: 'cart-model-y',
        title: 'Tesla Model Y',
        details: 'All-Electric Midsize SUV (AWD Dual Motor)',
        price: 44990,
        quantity: 1,
        category: 'vehicles',
        currency: 'USD',
        image: '/images/tesla_model_y.jpg',
      },
      {
        id: 'cart-starlink-mini',
        title: 'Starlink Mini Ultra-Portable Kit',
        details: 'Compact Backpack-Ready Satellite Terminal',
        price: 599,
        recurringMonthly: 50,
        quantity: 1,
        category: 'internet',
        currency: 'USD',
        image: '/images/starlink_mini_dish.jpg',
      },
      {
        id: 'cart-powerwall-3',
        title: 'Tesla Powerwall 3',
        details: '13.5 kWh Whole-Home Energy Storage + Solar Inverter',
        price: 8400,
        quantity: 1,
        category: 'energy',
        currency: 'USD',
        image: '/images/tesla_powerwall.jpg',
      },
    ];
  });

  // Wishlist State (Persisted)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('elon_musk_space_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'cybertruck',
        title: 'Tesla Cybertruck (Cyberbeast)',
        category: 'vehicles',
        price: 79990,
        image: '/images/tesla_cybertruck.jpg',
        dateAdded: 'Today',
      },
      {
        id: 'falcon-heavy',
        title: 'SpaceX Falcon Heavy Commercial Launch',
        category: 'space',
        price: 97000000,
        image: '/images/falcon_heavy.jpg',
        dateAdded: 'Today',
      },
    ];
  });

  // Notifications State
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals & Drawers
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Active topic for dedicated chat pre-fill
  const [chatTopic, setChatTopic] = useState<string>('');

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('elon_musk_space_cart', JSON.stringify(items));
    } catch {}
  };

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlistItems(items);
    try {
      localStorage.setItem('elon_musk_space_wishlist', JSON.stringify(items));
    } catch {}
  };

  // Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    const existingIndex = cartItems.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      saveCart([...cartItems, item]);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    saveCart(cartItems.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  // Wishlist Handlers
  const handleToggleWishlist = (item: {
    id: string;
    name?: string;
    title?: string;
    price: number;
    image: string;
    category: string;
  }) => {
    const exists = wishlistItems.some((w) => w.id === item.id);
    if (exists) {
      saveWishlist(wishlistItems.filter((w) => w.id !== item.id));
    } else {
      const newItem: WishlistItem = {
        id: item.id,
        title: item.name || item.title || 'Product',
        category: item.category,
        price: item.price,
        image: item.image,
        dateAdded: 'Today',
      };
      saveWishlist([newItem, ...wishlistItems]);
    }
  };

  const handleMoveWishlistToCart = (item: WishlistItem) => {
    handleAddToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: 1,
      image: item.image,
      category: item.category,
      currency: 'USD',
    });
    saveWishlist(wishlistItems.filter((w) => w.id !== item.id));
  };

  const handleClearWishlist = () => {
    saveWishlist([]);
  };

  // Scroll to section with optional topic pre-fill for chat
  const handleOpenMessageSupport = (topic?: string) => {
    if (topic) setChatTopic(topic);
    const chatEl = document.getElementById('chat');
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAnchor = (anchor: string) => {
    const target = document.querySelector(anchor);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-[#FFFFFF] font-sans selection:bg-[#00F0FF] selection:text-black">
      {/* 1. Master Navbar */}
      <MarketplaceNavbar
        cartItems={cartItems}
        wishlistItems={wishlistItems}
        notifications={notifications}
        userName={userName}
        userEmail={userEmail}
        onUpdateUser={onUpdateUser}
        onOpenCartDrawer={() => setCartDrawerOpen(true)}
        onOpenWishlistDrawer={() => setWishlistDrawerOpen(true)}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onNavigateAdmin={onNavigateAdmin}
        onOpenMessageSupport={handleOpenMessageSupport}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* 2. Master Hero Banner */}
      <MarketplaceHeroBanner
        onSearch={(q) => {
          setSearchModalOpen(true);
        }}
        onOpenMessageSupport={handleOpenMessageSupport}
        onSelectCategory={scrollToAnchor}
      />

      {/* 3. Technology Sections Lineup */}
      <main className="space-y-4">
        {/* A. Tesla Vehicles */}
        <TeslaVehiclesSection
          onAddToCart={(v) =>
            handleAddToCart({
              id: v.id,
              title: `Tesla ${v.name}`,
              details: `${v.category} · ${v.range} · ${v.acceleration}`,
              price: v.price,
              quantity: 1,
              category: 'vehicles',
              currency: 'USD',
              image: v.image,
            })
          }
          onToggleWishlist={(v) =>
            handleToggleWishlist({
              id: v.id,
              name: `Tesla ${v.name}`,
              price: v.price,
              image: v.image,
              category: 'vehicles',
            })
          }
          wishlistIds={wishlistItems.map((w) => w.id)}
          onOpenMessageSupport={handleOpenMessageSupport}
        />

        {/* B. Tesla Technology & Energy */}
        <TeslaEnergySection
          onAddEnergyToCart={(e) =>
            handleAddToCart({
              id: e.id,
              title: e.name,
              details: e.subtitle,
              price: e.priceStarting,
              quantity: 1,
              category: 'energy',
              currency: 'USD',
              image: e.image,
            })
          }
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistItems.map((w) => w.id)}
          onContactSales={(topic) => handleOpenMessageSupport(topic)}
        />

        {/* C. SpaceX Aerospace */}
        <SpaceXSection
          onAddSpaceToCart={(s) =>
            handleAddToCart({
              id: s.id,
              title: s.name,
              details: s.subtitle,
              price: s.deposit || s.price,
              quantity: 1,
              category: 'space',
              currency: 'USD',
              image: s.image,
            })
          }
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistItems.map((w) => w.id)}
          onOpenMessageSupport={handleOpenMessageSupport}
        />

        {/* D. Starlink Satellite Internet */}
        <StarlinkSection
          onAddStarlinkToCart={(st) =>
            handleAddToCart({
              id: st.id,
              title: st.name,
              details: st.tagline,
              price: st.price,
              recurringMonthly: st.monthlyFee,
              quantity: 1,
              category: 'internet',
              currency: 'USD',
              image: st.image,
            })
          }
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistItems.map((w) => w.id)}
          onOpenMessageSupport={handleOpenMessageSupport}
        />

        {/* E. xAI Grok Frontier Intelligence */}
        <GrokAISection
          onSubscribeTier={(t) => {
            handleAddToCart({
              id: t.id,
              title: `${t.name} (Monthly)`,
              details: t.description,
              price: t.priceMonthly,
              recurringMonthly: t.priceMonthly,
              quantity: 1,
              category: 'ai',
              currency: 'USD',
            });
            setCartDrawerOpen(true);
          }}
        />

        {/* F. Robotics (Tesla Optimus Gen 2) */}
        <OptimusAndXSection
          onJoinWaitlist={() => {
            // Waitlist joined confirmation
          }}
          onAddToCart={(item) => {
            handleAddToCart({
              id: item.id,
              title: item.title,
              details: 'Priority mass-production queue allocation',
              price: item.price,
              quantity: 1,
              category: 'robots',
              currency: 'USD',
              image: item.image,
            });
            setCartDrawerOpen(true);
          }}
        />

        {/* G. Mobile & SatCom + H. Neuralink + I. Boring Loop + J. X Platform */}
        <FutureProjectsSection />

        {/* 4. Investment Information & Public Financials */}
        <ExpralInvestmentSection
          onSelectPlan={(plan, amount) => {
            handleOpenMessageSupport(
              `Investment syndicate consultation for ${plan.title} (Allocated amount: $${amount.toLocaleString()})`
            );
          }}
          onOpenMessageSupport={handleOpenMessageSupport}
        />

        {/* 5. Latest Technology News & Community Section */}
        <TechNewsAndCommunitySection
          onOpenMessageSupport={handleOpenMessageSupport}
          userName={userName}
        />

        {/* 6. Dedicated 1-to-1 Chat Section (Permanent Firestore Storage) */}
        <DedicatedChatSection
          visitorId={visitorId}
          initialTopic={chatTopic}
          userName={userName}
          userEmail={userEmail}
        />

        {/* 7. Shopping Cart & Checkout Fulfillment Section */}
        <CartAndCheckoutSection
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          userName={userName}
          onOpenMessageSupport={handleOpenMessageSupport}
        />
      </main>

      {/* 8. Slide-Out Drawers & Modals */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          const el = document.getElementById('checkout');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={(id) => saveWishlist(wishlistItems.filter((w) => w.id !== id))}
        onMoveToCart={handleMoveWishlistToCart}
        onClearWishlist={handleClearWishlist}
      />

      <TechnologySearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={scrollToAnchor}
      />

      {/* 9. Platform Footer */}
      <Footer />

      {/* 10. Floating "MESSAGE ELON MUSK SPACE" Quick Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenMessageSupport('Quick inquiry from floating launcher')}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#1E88E5] text-[#050A14] font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Open your private 1-to-1 support conversation"
          aria-label="Message Elon Musk Space"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#050A14] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#050A14]"></span>
          </span>
          <span className="font-extrabold uppercase tracking-wider">MESSAGE ELON MUSK SPACE</span>
        </button>
      </div>
    </div>
  );
};
