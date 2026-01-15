import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface CartItem {
  item: MenuItem;
  quantity: number;
  options?: string[]; // For selected modifiers
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, options?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
  favorites: MenuItem[];
  addFavorite: (item: MenuItem) => void;
  removeFavorite: (itemId: string) => void;
  toggleFavorite: (item: MenuItem) => void;
  isFavorite: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Persist cart across sessions (Native feel)
    const saved = localStorage.getItem('dinein_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<MenuItem[]>(() => {
    // Persist favorites across sessions
    const saved = localStorage.getItem('dinein_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dinein_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dinein_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Clear cart after 24 hours
  useEffect(() => {
    const cartTimestamp = localStorage.getItem('dinein_cart_timestamp');
    if (cartTimestamp) {
      const timestamp = parseInt(cartTimestamp, 10);
      const now = Date.now();
      const hoursSince = (now - timestamp) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        setCart([]);
        localStorage.removeItem('dinein_cart');
        localStorage.removeItem('dinein_cart_timestamp');
      }
    } else {
      localStorage.setItem('dinein_cart_timestamp', Date.now().toString());
    }
  }, []);

  const addToCart = (item: MenuItem, quantity = 1, options: string[] = []) => {
    setCart(prev => {
      // Check if item with same ID AND same options exists
      const existingIndex = prev.findIndex(
        p => p.item.id === item.id && JSON.stringify(p.options) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { item, quantity, options }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === itemId);
      if (existing && existing.quantity > 1) {
         return prev.map(p => p.item.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.item.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('dinein_cart');
    localStorage.removeItem('dinein_cart_timestamp');
  };

  const addFavorite = (item: MenuItem) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFavorite = (itemId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== itemId));
  };

  const toggleFavorite = (item: MenuItem) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.id === itemId);
  };

  const totalAmount = cart.reduce((sum, current) => {
      // Calculate base price + modifiers could go here
      return sum + (current.item.price * current.quantity);
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      totalAmount, 
      totalItems,
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};