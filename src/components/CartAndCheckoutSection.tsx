import React, { useState } from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, X, Package, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartAndCheckoutSectionProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  userName: string;
  onDirectOrderChat?: (itemsSummary: string, total: number) => void;
  onOpenMessageSupport?: (topic: string) => void;
}

interface OrderConfirmation {
  orderId: string;
  customerName: string;
  email: string;
  address: string;
  items: CartItem[];
  oneTimeTotal: number;
  monthlyTotal: number;
  timestamp: string;
}

export const CartAndCheckoutSection: React.FC<CartAndCheckoutSectionProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userName,
  onDirectOrderChat,
  onOpenMessageSupport,
}) => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('Austin, Texas, USA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderConfirmation | null>(null);

  // Compute Totals
  const oneTimeTotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const monthlyTotal = cartItems.reduce((acc, item) => {
    return acc + (item.recurringMonthly || 0) * item.quantity;
  }, 0);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customer: {
            name: userName || 'Explorer',
            email: customerEmail || 'customer@elonmuskspace.com',
            address: deliveryAddress,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      const generatedOrderId = data.orderId || `EMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#1E88E5', '#FFFFFF', '#34D399'],
        });
      } catch {
        // ignore
      }

      setCompletedOrder({
        orderId: generatedOrderId,
        customerName: userName || 'Explorer',
        email: customerEmail || 'customer@elonmuskspace.com',
        address: deliveryAddress,
        items: [...cartItems],
        oneTimeTotal,
        monthlyTotal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      onClearCart();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="checkout" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Order Fulfillment & Logistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Shopping Cart & Checkout
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Review your selected Tesla vehicles, Starlink hardware kits, Powerwall storage, and mission reservations.
          </p>
        </div>
      </div>

      {completedOrder ? (
        <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-8 text-center max-w-2xl mx-auto shadow-[0_0_30px_rgba(0,240,255,0.15)]">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Order Prepared & Confirmed</h3>
          <p className="text-xs text-[#AAB7CC] mb-6">
            Order <strong className="text-[#00F0FF] font-mono">{completedOrder.orderId}</strong> recorded at {completedOrder.timestamp}.
          </p>

          <div className="p-4 rounded-xl bg-[#050A14] border border-[#1A2A4A] text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between py-1 border-b border-[#1A2A4A]/60">
              <span className="text-[#AAB7CC]">Recipient</span>
              <span className="text-white font-semibold">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A2A4A]/60">
              <span className="text-[#AAB7CC]">Delivery Destination</span>
              <span className="text-white">{completedOrder.address}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A2A4A]/60">
              <span className="text-[#AAB7CC]">Total One-Time Amount</span>
              <span className="text-[#00F0FF] font-mono font-bold">${completedOrder.oneTimeTotal.toLocaleString()}</span>
            </div>
            {completedOrder.monthlyTotal > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-[#AAB7CC]">Monthly Recurring Services</span>
                <span className="text-emerald-400 font-mono font-bold">${completedOrder.monthlyTotal.toLocaleString()}/mo</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCompletedOrder(null)}
              className="flex-1 py-2.5 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all"
            >
              Continue Shopping
            </button>
            {onOpenMessageSupport && (
              <button
                onClick={() =>
                  onOpenMessageSupport(
                    `Inquiry regarding confirmed order ${completedOrder.orderId} (Total: $${completedOrder.oneTimeTotal.toLocaleString()})`
                  )
                }
                className="py-2.5 px-4 rounded-xl bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-white text-xs font-semibold transition-colors"
              >
                Track With Support Team
              </button>
            )}
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-12 text-center max-w-xl mx-auto">
          <Package className="w-12 h-12 text-[#AAB7CC] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white mb-1">Your Cart is Currently Empty</h3>
          <p className="text-xs text-[#AAB7CC] mb-6">
            Explore Tesla vehicles, Starlink hardware kits, Powerwall energy units, or SpaceX mission slots to add items to your cart.
          </p>
          <a
            href="#vehicles"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all"
          >
            <span>Explore Tesla Vehicles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 text-xs text-[#AAB7CC]">
              <span>{cartItems.length} Product Types Selected</span>
              <button
                onClick={onClearCart}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear All
              </button>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-14 rounded-lg bg-[#050A14] object-contain border border-[#1A2A4A] p-1 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                    {item.details && (
                      <p className="text-[11px] text-[#AAB7CC] truncate">{item.details}</p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-[#00F0FF]">
                        ${item.price.toLocaleString()}
                      </span>
                      {item.recurringMonthly && (
                        <span className="text-[10px] text-[#AAB7CC] font-mono">
                          +${item.recurringMonthly}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 text-[#AAB7CC] hover:text-white rounded hover:bg-[#0A152A]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono px-1.5 text-white font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 text-[#AAB7CC] hover:text-white rounded hover:bg-[#0A152A]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-[#AAB7CC] hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary & Checkout Form */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#1A2A4A]">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-[#AAB7CC] mb-4">
              <div className="flex justify-between">
                <span>Subtotal (Hardware & Vehicles)</span>
                <span className="font-mono text-white">${oneTimeTotal.toLocaleString()}</span>
              </div>
              {monthlyTotal > 0 && (
                <div className="flex justify-between">
                  <span>Recurring Services (Monthly)</span>
                  <span className="font-mono text-[#00F0FF]">${monthlyTotal.toLocaleString()}/mo</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Freight & Transport</span>
                <span className="font-mono text-emerald-400">Included (Complimentary)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1A2A4A] text-sm font-bold text-white">
                <span>Total Due</span>
                <span className="font-mono text-xl text-[#00F0FF]">${oneTimeTotal.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePayNow} className="space-y-3 pt-3 border-t border-[#1A2A4A]">
              <div>
                <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">
                  Delivery Destination / Local Service Hub
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#AAB7CC]" />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">
                  Contact Email for Order Tracking
                </label>
                <input
                  type="email"
                  placeholder="your-email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 mt-4"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Preparing Order Manifest...'
                    : `Complete Order Preparation ($${oneTimeTotal.toLocaleString()})`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
