import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistApi } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res.data.success) {
        const items = res.data.data;
        setWishlistItems(items);
        setWishlistIds(new Set(items.map(item => item._id || item)));
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true };
    }
    const productId = product._id;
    const isCurrentlyIn = wishlistIds.has(productId);

    try {
      if (isCurrentlyIn) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        setWishlistItems(prev => prev.filter(item => (item._id || item) !== productId));
      } else {
        await wishlistApi.addToWishlist(productId);
        setWishlistIds(prev => new Set(prev).add(productId));
        setWishlistItems(prev => [...prev, product]);
      }
      return { success: true, isInWishlist: !isCurrentlyIn };
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      return { success: false, error: err.message };
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ wishlistItems, wishlistIds, loading, toggleWishlist, isInWishlist, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
