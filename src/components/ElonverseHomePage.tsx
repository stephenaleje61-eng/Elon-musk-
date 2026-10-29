import React, { useState } from 'react';
import { ElonSpaceXHeroSection } from './ElonSpaceXHeroSection';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { TeslaVehiclesSection } from './TeslaVehiclesSection';
import { SpaceXSection } from './SpaceXSection';
import { GrokAISection } from './GrokAISection';
import { TeslaEnergySection } from './TeslaEnergySection';
import { OptimusAndXSection } from './OptimusAndXSection';
import { FutureProjectsSection } from './FutureProjectsSection';
import { PublicStatementsAndEmpireSection } from './PublicStatementsAndEmpireSection';
import { ExpralInvestmentSection } from './ExpralInvestmentSection';
import { CartAndCheckoutSection } from './CartAndCheckoutSection';
import { MessageElonBanner } from './MessageElonBanner';
import { Footer } from './Footer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { sendChatMessage, registerVisitor } from '../services/firebaseChat';
import { sounds } from '../utils/audio';
import { VerifiedBadge } from './VerifiedBadge';
import { ArrowRight, X, ShieldCheck, ShoppingCart, MessageSquare, MapPin } from 'lucide-react';
import { CartItem, Vehicle, SpaceProduct, StarlinkProduct, GrokTier, EnergyProduct, ExpralInvestmentPlan } from '../types';

interface ElonverseHomePageProps {
  userName: string;
  userCity: string;
  userId?: string;
  onNavigateToChat: (name?: string, city?: string, orderTitle?: string) => void;
  onUpdateUserName: (name: string) => void;
}

export const ElonverseHomePage: React.FC<ElonverseHomePageProps> = ({
  userName,
  userCity,
  userId,
  onNavigateToChat,
  onUpdateUserName,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [directOrderModalItem, setDirectOrderModalItem] = useState<{
    title: string;
    price?: number;
    image?: string;
    category?: string;
  } | null>(null);
  const [orderBuyerName, setOrderBuyerName] = useState(userName || '');
  const [orderBuyerCity, setOrderBuyerCity] = useState(userCity || 'Austin, TX');
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elonverse_cart');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial pre-filled showcase cart items matching mockup
    return [
      {
        id: 'cart-model-y',
        title: 'Tesla Model Y',
        details: 'All-Electric SUV 5-Seat (AWD Dual Motor)',
        price: 44990,
        quantity: 1,
        category: 'vehicles',
        currency: 'USD',
        image: '/src/assets/images/tesla_vehicles_lineup_1793126081993.jpg',
      },
      {
        id: 'cart-starlink-standard',
        title: 'Starlink Standard Kit',
        details: 'Residential High-Speed Low Latency',
        price: 349,
        recurringMonthly: 120,
        quantity: 1,
        category: 'internet',
        currency: 'USD',
        image: '/src/assets/images/spacex_starship_launch_1793126082661.jpg',
      },
      {
        id: 'cart-grok-premium',
        title: 'Grok X Premium Tier',
        details: 'Fun Mode + Vision + Real-time X Live Data',
        price: 8,
        recurringMonthly: 8,
        quantity: 1,
        category: 'ai',
        currency: 'USD',
        image: '/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg',
      },
      {
        id: 'cart-optimus-deposit',
        title: 'Optimus Humanoid Robot (Deposit)',
        details: 'Gen 3 Helper Robot Priority Queue',
        price: 1000,
        quantity: 1,
        category: 'robots',
        currency: 'USD',
        image: '/src/assets/images/optimus_humanoid_robot_1793126083833.jpg',
      },
    ];
  });

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('elonverse_cart', JSON.stringify(items));
    } catch {}
  };

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

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToVehicles = () => {
    const el = document.getElementById('vehicles');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInitiateDirectOrder = (item: {
    title: string;
    price?: number;
    image?: string;
    category?: string;
  }) => {
    setDirectOrderModalItem(item);
    setOrderBuyerName(userName || '');
    setOrderBuyerCity(userCity || 'Austin, TX');
  };

  const handleHeroOrderNow = () => {
    handleInitiateDirectOrder({
      title: 'Tesla / Elonverse Order',
      price: 44990,
      image: '/src/assets/images/elonverse_hero_space_car_1793126081951.jpg',
      category: 'vehicles',
    });
  };

  const handleConfirmOrderAndChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingOrder) return;
    setIsSendingOrder(true);

    const finalName = orderBuyerName.trim() || userName || 'Customer';
    const finalCity = orderBuyerCity.trim() || userCity || 'Austin, TX';
    const itemTitle = directOrderModalItem?.title || 'Tesla Vehicle';
    const itemPrice = directOrderModalItem?.price;
    const currentUserId = userId || localStorage.getItem('elonverse_direct_user_id') || 'usr-direct';

    onUpdateUserName(finalName);
    try {
      localStorage.setItem('elonverse_user_name', finalName);
      localStorage.setItem('elonverse_user_city', finalCity);
    } catch {}

    try {
      // Register visitor document in 'visitors' collection
      await registerVisitor({
        visitorId: currentUserId,
        name: finalName,
        location: finalCity,
        intent: `order: ${itemTitle}`,
        lastMessage: `Order: ${itemTitle}`,
      });

      // 1. Send customer's order inquiry message
      await sendChatMessage({
        name: finalName,
        city: finalCity,
        message: `Hello Elon! 🚗 I want to order the ${itemTitle}${itemPrice ? ` ($${itemPrice.toLocaleString()})` : ''}. Can we have a private chat to discuss details, delivery, and complete my purchase?`,
        sender: 'visitor',
        isElon: false,
        isAdmin: false,
        userId: currentUserId,
        visitorId: currentUserId,
        intent: `order: ${itemTitle}`,
      });

      // 2. Send instant system confirmation in thread
      await sendChatMessage({
        name: 'System',
        city: 'Starbase, TX',
        message: `🚀 Order request for "${itemTitle}" sent directly to Elon Musk 👑 (Verified Owner)! Elon has been alerted and will chat with you privately right here.`,
        sender: 'system',
        isElon: false,
        isAdmin: false,
        isSystem: true,
        userId: currentUserId,
        visitorId: currentUserId,
        intent: `order: ${itemTitle}`,
      });

      sounds.playSentSound();
    } catch (err) {
      console.warn('Order dispatch fallback:', err);
    } finally {
      setIsSendingOrder(false);
      setDirectOrderModalItem(null);
      onNavigateToChat(finalName, finalCity, itemTitle);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#1D9BF0] selection:text-white">
      {/* 1. TOP WELCOME SECTION (Mandatory per specification):
          - Background: SpaceX black with stars
          - Big text center: "Welcome to ELON SPACE X"
          - Subtext: "Chat with Elon AI - Inspired by Elon Musk"
          - Big button: [ 🚀 Chat Elon Musk Now ] - color: SpaceX blue, big, rounded, glowing
      */}
      <ElonSpaceXHeroSection
        savedName={userName}
        onChatNow={(enteredName, enteredCity) => {
          onNavigateToChat(enteredName, enteredCity);
        }}
        onExploreScroll={scrollToVehicles}
      />

      {/* 2. STICKY NAVBAR */}
      <Navbar
        cartItems={cartItems}
        onOpenCart={scrollToCheckout}
        onOpenSearch={() => setSearchModalOpen(true)}
        userName={userName || 'Explorer'}
        onUpdateUserName={onUpdateUserName}
        activeSection="home"
      />

      {/* Quick Chat Strip Bar */}
      <div className="bg-[#0b131e] border-y border-[#1D9BF0]/30 py-2.5 px-4 text-center flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-mono text-[#89cbfc]">
        <span className="flex items-center gap-1.5 font-bold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Live Chat Active</span>
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="text-neutral-300">Talk 1-on-1 with Elon Musk (Owner 👑)</span>
        <button
          onClick={() => onNavigateToChat(userName, userCity)}
          className="ml-2 px-3 py-1 rounded-full bg-[#1D9BF0] text-white text-xs font-bold hover:bg-[#1a8cd8] transition-colors shadow-[0_0_15px_rgba(29,155,240,0.6)]"
        >
          Open Chat &rarr;
        </button>
      </div>

      {/* 3. HERO OVERVIEW SECTION */}
      <HeroSection
        onOrderNow={handleHeroOrderNow}
        onExploreUniverse={scrollToVehicles}
      />

      {/* 4. BUSINESS EMPIRE, SHAREHOLDINGS & STATEMENTS TRACKER (Prompt 10 Requirement) */}
      <PublicStatementsAndEmpireSection />

      {/* 5. TESLA VEHICLES SECTION */}
      <TeslaVehiclesSection
        onOrderNowDirect={(vehicle: Vehicle) => {
          handleInitiateDirectOrder({
            title: `Tesla ${vehicle.name}`,
            price: vehicle.price,
            image: vehicle.image,
            category: 'vehicles',
          });
        }}
        onAddToCart={(vehicle: Vehicle) => {
          handleAddToCart({
            id: `vehicle-${vehicle.id}`,
            title: `Tesla ${vehicle.name}`,
            details: vehicle.tagline,
            price: vehicle.price,
            quantity: 1,
            category: 'vehicles',
            currency: vehicle.currency || 'USD',
            image: vehicle.image,
          });
          scrollToCheckout();
        }}
      />

      {/* 6. SPACEX & STARLINK SECTION */}
      <SpaceXSection
        onAddSpaceToCart={(sp: SpaceProduct) => {
          handleAddToCart({
            id: `space-${sp.id}`,
            title: sp.name,
            details: sp.subtitle,
            price: sp.deposit || sp.price,
            quantity: 1,
            category: 'space',
            currency: 'USD',
            image: sp.image,
          });
          scrollToCheckout();
        }}
        onAddStarlinkToCart={(sl: StarlinkProduct) => {
          handleAddToCart({
            id: `starlink-${sl.id}`,
            title: sl.name,
            details: `Monthly fee: $${sl.monthlyFee || 120}/mo`,
            price: sl.price,
            recurringMonthly: sl.monthlyFee || 120,
            quantity: 1,
            category: 'internet',
            currency: sl.currency || 'USD',
            image: '/src/assets/images/spacex_starship_launch_1793126082661.jpg',
          });
          scrollToCheckout();
        }}
      />

      {/* 7. xAI & GROK SECTION */}
      <GrokAISection
        onSubscribeTier={(tier: GrokTier) => {
          handleAddToCart({
            id: `grok-${tier.id}`,
            title: `xAI Grok - ${tier.name}`,
            details: tier.features[0] || 'Grok Multimodal Access',
            price: tier.priceMonthly,
            recurringMonthly: tier.priceMonthly,
            quantity: 1,
            category: 'ai',
            currency: tier.currency || 'USD',
            image: '/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg',
          });
          scrollToCheckout();
        }}
      />

      {/* 8. TESLA ENERGY SECTION */}
      <TeslaEnergySection
        onAddEnergyToCart={(energy: EnergyProduct) => {
          handleAddToCart({
            id: `energy-${energy.id}`,
            title: energy.name,
            details: energy.capacity || energy.subtitle || 'Clean Energy Storage',
            price: energy.priceStarting,
            quantity: 1,
            category: 'energy',
            currency: energy.currency || 'USD',
            image: energy.image,
          });
          scrollToCheckout();
        }}
        onContactSales={scrollToCheckout}
      />

      {/* 9. OPTIMUS & X PLATFORM SECTION */}
      <OptimusAndXSection
        onJoinWaitlist={() => {
          handleAddToCart({
            id: 'optimus-gen3-waitlist',
            title: 'Optimus Gen 3 Helper Robot',
            details: 'Priority Factory Queue Deposit',
            price: 1000,
            quantity: 1,
            category: 'robots',
            currency: 'USD',
            image: '/src/assets/images/optimus_humanoid_robot_1793126083833.jpg',
          });
          scrollToCheckout();
        }}
        onSubscribeX={() => {
          handleAddToCart({
            id: 'x-premium-annual',
            title: 'X Premium Blue Verification',
            details: 'Annual Subscription + Tipping Rights',
            price: 84,
            quantity: 1,
            category: 'ai',
            currency: 'USD',
            image: '/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg',
          });
          scrollToCheckout();
        }}
      />

      {/* 10. FUTURE PROJECTS SECTION */}
      <FutureProjectsSection />

      {/* 11. EXPRAL INVESTMENT SECTION */}
      <ExpralInvestmentSection
        onSelectPlan={(plan: ExpralInvestmentPlan, customAmount: number) => {
          handleAddToCart({
            id: `invest-${plan.id}`,
            title: `${plan.title} Participation`,
            details: `Target Yield: ${plan.targetYieldApy}% APY · ${plan.durationMonths} Mos`,
            price: customAmount,
            quantity: 1,
            category: 'investments',
            currency: 'USD',
            image: '/src/assets/images/elonverse_hero_space_car_1793126081951.jpg',
          });
          scrollToCheckout();
        }}
      />

      {/* 12. CART AND QUICK CHECKOUT SECTION */}
      <div id="checkout" className="scroll-mt-24">
        <CartAndCheckoutSection
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          userName={userName || 'Explorer'}
          onDirectOrderChat={(summary, total) => {
            handleInitiateDirectOrder({
              title: `Consolidated Cart (${summary})`,
              price: total,
              category: 'cart',
            });
          }}
        />
      </div>

      {/* 13. MESSAGE ELON BANNER (Links to /chat) */}
      <div onClick={() => onNavigateToChat(userName, userCity)} className="cursor-pointer">
        <MessageElonBanner userName={userName || 'Explorer'} />
      </div>

      {/* 14. FOOTER */}
      <Footer />

      {/* DIRECT ORDER & PRIVATE CHAT WITH OWNER MODAL */}
      {directOrderModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left">
            <button
              onClick={() => setDirectOrderModalItem(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Direct Owner Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Direct Owner Private Chat
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Order via Private Chat
              </h3>
              <VerifiedBadge type="owner" size="md" />
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed mb-5">
              Tapping start will connect you 1-on-1 with <strong className="text-white">Elon Musk 👑 (Verified Owner)</strong>. Your order request will be sent directly to Elon so you can discuss delivery, payment, and finalize your purchase in real-time.
            </p>

            {/* Item Card Preview */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3.5 mb-5">
              {directOrderModalItem.image ? (
                <img
                  src={directOrderModalItem.image}
                  alt={directOrderModalItem.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-14 object-cover rounded-lg border border-neutral-800 shrink-0"
                />
              ) : (
                <div className="w-16 h-14 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center text-amber-400 text-xl font-bold shrink-0">
                  🚗
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                  Target Order
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {directOrderModalItem.title}
                </div>
                {directOrderModalItem.price !== undefined && (
                  <div className="text-xs font-mono text-emerald-400 font-semibold">
                    ${directOrderModalItem.price.toLocaleString()} USD
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Contact Form */}
            <form onSubmit={handleConfirmOrderAndChat} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={orderBuyerName}
                  onChange={(e) => setOrderBuyerName(e.target.value)}
                  placeholder="e.g. John Doe / Explorer"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                  Your City / Location
                </label>
                <input
                  type="text"
                  required
                  value={orderBuyerCity}
                  onChange={(e) => setOrderBuyerCity(e.target.value)}
                  placeholder="e.g. Austin, TX or Los Angeles, CA"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingOrder}
                  className="w-full py-3 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  {isSendingOrder ? (
                    <span>Connecting to Elon...</span>
                  ) : (
                    <>
                      <span>START PRIVATE CHAT WITH ELON MUSK &rarr;</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-center text-neutral-500 font-mono">
                Elon Musk (Owner) is Online 🟢 · Real-time reply guaranteed
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL SEARCH MODAL */}
      {searchModalOpen && (
        <GlobalSearchModal
          onClose={() => setSearchModalOpen(false)}
          onSelectResult={(href) => {
            setSearchModalOpen(false);
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}
    </div>
  );
};
