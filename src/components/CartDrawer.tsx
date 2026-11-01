import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const totalOneTime = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A152A] border-l border-[#1A2A4A] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1A2A4A] mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#00F0FF]" />
                <h3 className="text-lg font-bold text-white">Shopping Cart</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#AAB7CC] hover:text-white hover:bg-[#050A14] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-[#AAB7CC]/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Your Cart is Empty</p>
                <p className="text-xs text-[#AAB7CC]">
                  Browse our Tesla, Starlink, or Powerwall collections and add items to your cart.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#050A14] border border-[#1A2A4A] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-12 rounded-lg bg-[#0A152A] object-contain border border-[#1A2A4A] p-1 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <span className="text-xs font-mono font-bold text-[#00F0FF] block mt-0.5">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 text-[#AAB7CC] hover:text-white rounded"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-mono px-1 text-white font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 text-[#AAB7CC] hover:text-white rounded"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-[#AAB7CC] hover:text-rose-400"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-[#1A2A4A] space-y-3">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-[#AAB7CC]">Subtotal</span>
                <span className="text-xl font-bold font-mono text-[#00F0FF]">
                  ${totalOneTime.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.35)]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
