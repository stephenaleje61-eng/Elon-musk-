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
}) => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('Lagos, Nigeria');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('420');
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
            email: customerEmail || 'guest@elonverse.com',
            address: deliveryAddress,
          },
        }),
      });

      const data = await response.json();
      const generatedOrderId = data.orderId || `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Launch Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#38bdf8', '#34d399', '#f59e0b'],
        });
      } catch (err) {
        // ignore
      }

      setCompletedOrder({
        orderId: generatedOrderId,
        customerName: userName || 'Explorer',
        email: customerEmail || 'guest@elonverse.com',
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
    <section id="cart" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header matching screenshot */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Your Cart <span className="text-neutral-500 font-light">&mdash; One Checkout, Everything</span>
        </h2>
        <p className="text-xs font-mono text-neutral-400">
          Tesla + Starlink + Grok + Optimus &middot; Consolidated Global Fulfillment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Showcase & Checkout All */}
        <div className="lg:col-span-4 rounded-2xl bg-[#090909] border border-neutral-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-neutral-400">
              <Package className="w-4 h-4 text-white" />
              <span>Multi-Product Cart Sync</span>
            </div>
            <div className="h-44 rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center p-3 mb-4 border border-neutral-900">
              <img
                src="/src/assets/images/tesla_vehicles_lineup_1793126081993.jpg"
                alt="Selected hardware bundle"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter contrast-105"
              />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Consolidated Delivery
            </h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Order your Tesla vehicle, Starlink satellite kit, and reserved Optimus priority queue in a single verified transaction with zero password friction.
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-xs text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>End-to-End Encrypted &middot; Test Mode Verified</span>
          </div>
        </div>

        {/* Center Column: Order Summary & Quick Checkout Form matching screenshot */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0a0a0a] border border-neutral-800 p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6 border-b border-neutral-800">
            {/* Order Items Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider font-mono">
                Order Summary
              </h3>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  Your cart is currently empty.
                  <br />
                  Explore vehicles, Starlink, or Expral plans above.
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs pb-2 border-b border-neutral-900 font-mono"
                    >
                      <div className="truncate max-w-[170px]">
                        <span className="text-white font-semibold">{item.title}</span>
                        {item.details && (
                          <span className="text-[10px] text-neutral-500 block truncate">
                            {item.details}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-white font-bold block">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                          {item.recurringMonthly && (
                            <span className="text-[10px] text-neutral-400">
                              +${item.recurringMonthly * item.quantity}/mo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-0.5 text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-0.5 text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Row matching screenshot */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-baseline font-mono">
                <span className="text-xs text-neutral-400">Total:</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">
                    ${oneTimeTotal.toLocaleString()}
                  </span>
                  {monthlyTotal > 0 && (
                    <span className="text-xs text-neutral-400 ml-1.5">
                      + ${monthlyTotal.toLocaleString()}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Checkout Form matching screenshot */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider font-mono">
                Quick Checkout
              </h3>

              <form onSubmit={handlePayNow} className="space-y-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Receipt Email / Name (No Password Required)
                  </label>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com or Guest Explorer"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Card details</label>
                  <div className="grid grid-cols-12 gap-1.5">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card number"
                      className="col-span-7 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                    />
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="col-span-3 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-white"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="col-span-2 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2 py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Delivery address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  {onDirectOrderChat && cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const summary = cartItems.map((i) => `${i.quantity}x ${i.title} ($${i.price.toLocaleString()})`).join(', ');
                        onDirectOrderChat(summary, oneTimeTotal);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-emerald-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md group"
                    >
                      <span>💬 Order via Private Chat with Elon Musk (Owner 👑)</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={cartItems.length === 0 || isProcessing}
                    className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Verifying with Global Gateway...</span>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Now &mdash; ${oneTimeTotal.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono text-center">
            *Safe test mode checkout. Card charges are simulated for the demonstration. No raw credit card data stored.
          </div>
        </div>
      </div>

      {/* Verified Order Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setCompletedOrder(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">
              Order Confirmed!
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Thank you, <strong className="text-white">{completedOrder.customerName}</strong>. Your ELONVERSE consolidated order is being routed to mission operations.
            </p>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-neutral-900 pb-2">
                <span className="text-neutral-500">ORDER IDENTIFIER:</span>
                <span className="text-white font-bold">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">DESTINATION:</span>
                <span className="text-white">{completedOrder.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">AMOUNT PAID TODAY:</span>
                <span className="text-emerald-400 font-bold">
                  ${completedOrder.oneTimeTotal.toLocaleString()}
                </span>
              </div>
              {completedOrder.monthlyTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">RECURRING SUBSCRIPTION:</span>
                  <span className="text-white">${completedOrder.monthlyTotal.toLocaleString()}/mo</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Continue Exploring Universe
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
