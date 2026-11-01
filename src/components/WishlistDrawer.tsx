import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { WishlistItem } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistItem[];
  onRemoveFromWishlist: (id: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
  onClearWishlist: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onMoveToCart,
  onClearWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A152A] border-l border-[#1A2A4A] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1A2A4A] mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-current" />
                <h3 className="text-lg font-bold text-white">Your Saved Wishlist</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#AAB7CC] hover:text-white hover:bg-[#050A14] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-[#AAB7CC]/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Your Wishlist is Empty</p>
                <p className="text-xs text-[#AAB7CC]">
                  Tap the heart icon on any Tesla vehicle, Starlink kit, or Powerwall to save it for later.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                <div className="flex justify-between items-center text-xs text-[#AAB7CC] pb-1">
                  <span>{wishlistItems.length} Saved Technologies</span>
                  <button
                    onClick={onClearWishlist}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Clear All
                  </button>
                </div>

                {wishlistItems.map((item) => (
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
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onMoveToCart(item)}
                        className="py-1.5 px-2.5 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center gap-1"
                        title="Move to Cart"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Move</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(item.id)}
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

          <div className="pt-4 border-t border-[#1A2A4A]">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#050A14] border border-[#1A2A4A] text-white text-xs font-semibold hover:border-white transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
