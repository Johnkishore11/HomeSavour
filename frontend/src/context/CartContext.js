import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartChefId, setCartChefId] = useState(null);

    const addToCart = (dish, chefId) => {
        // If cart has items from a different chef, clear it first
        if (cartChefId && cartChefId !== chefId) {
            setCartItems([]);
            setCartChefId(chefId);
        }
        if (!cartChefId) setCartChefId(chefId);

        setCartItems(prev => {
            const existing = prev.find(item => item._id === dish._id);
            if (existing) {
                return prev.map(item =>
                    item._id === dish._id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { ...dish, qty: 1 }];
        });
    };

    const removeFromCart = (dishId) => {
        setCartItems(prev => {
            const updated = prev
                .map(item => item._id === dishId ? { ...item, qty: item.qty - 1 } : item)
                .filter(item => item.qty > 0);
            if (updated.length === 0) setCartChefId(null);
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setCartChefId(null);
    };

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return (
        <CartContext.Provider value={{ cartItems, cartChefId, addToCart, removeFromCart, clearCart, totalAmount, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
