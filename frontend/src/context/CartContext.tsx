import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  instructions: string;
  setInstructions: (val: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('canteen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [instructions, setInstructions] = useState<string>(() => {
    return localStorage.getItem('canteen_cart_instructions') || '';
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_cart', JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('canteen_cart_instructions', instructions);
  }, [instructions]);

  const addToCart = (item: MenuItem) => {
    if (!item.available) return;

    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.itemId === item.itemId);
      if (existing) {
        return prev.map((ci) =>
          ci.item.itemId === item.itemId
            ? { ...ci, quantity: Math.min(ci.quantity + 1, 20) }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((ci) => {
          if (ci.item.itemId === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: Math.min(newQty, 20) } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setInstructions('');
    localStorage.removeItem('canteen_cart');
    localStorage.removeItem('canteen_cart_instructions');
  };

  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        instructions,
        setInstructions,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
