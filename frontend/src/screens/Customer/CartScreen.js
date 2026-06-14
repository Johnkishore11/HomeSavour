import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, StatusBar
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';
const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;

export default function CartScreen({ navigation }) {
    const { user } = useAuth();
    const { cartItems, cartChefId, totalAmount, addToCart, removeFromCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            const token = await user.getIdToken();
            await axios.post(`${API_URL}/orders`, {
                chefId: cartChefId,
                items: cartItems.map(item => ({
                    dishId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.qty,
                })),
                totalAmount,
                pickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            }, { headers: { Authorization: `Bearer ${token}` } });

            clearCart();
            Alert.alert('Order Placed! 🎉', 'Your order has been sent to the chef. Pickup ready in ~30 mins.', [
                { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
                { text: 'Go Home', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to place order. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <StatusBar barStyle="dark-content" backgroundColor={BG} />
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySub}>Browse nearby home chefs and add some delicious food!</Text>
                <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.browseBtnText}>Browse Chefs 🍽️</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>My Cart</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear', style: 'destructive', onPress: clearCart }
                    ])}>
                        <Text style={styles.clearText}>Clear all</Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                {cartItems.map(item => (
                    <View key={item._id} style={styles.cartItem}>
                        <View style={styles.cartItemLeft}>
                            <Text style={styles.cartItemName}>{item.name}</Text>
                            <Text style={styles.cartItemUnit}>₹{item.price} per item</Text>
                        </View>
                        <View style={styles.qtyControls}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => removeFromCart(item._id)}
                            >
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyNum}>{item.qty}</Text>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => addToCart(item, cartChefId)}
                            >
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cartItemTotal}>₹{item.price * item.qty}</Text>
                    </View>
                ))}

                {/* Bill Summary */}
                <View style={styles.billCard}>
                    <Text style={styles.billTitle}>Bill Summary</Text>
                    {cartItems.map(item => (
                        <View key={item._id} style={styles.billRow}>
                            <Text style={styles.billItemName}>{item.name} ×{item.qty}</Text>
                            <Text style={styles.billItemAmt}>₹{item.price * item.qty}</Text>
                        </View>
                    ))}
                    <View style={styles.billDivider} />
                    <View style={styles.billRow}>
                        <Text style={styles.billFee}>Platform Fee</Text>
                        <Text style={[styles.billFeeAmt, { color: ACCENT }]}>Free 🎉</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billTotal}>Total</Text>
                        <Text style={styles.billTotalAmt}>₹{totalAmount}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>⏱️ Estimated pickup time: ~30 minutes</Text>
                    <Text style={styles.infoText}>🏠 This is a home kitchen — please pick up at the chef's location</Text>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Checkout Bar */}
            <View style={styles.checkoutBar}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, loading && { opacity: 0.7 }]}
                    onPress={handleCheckout}
                    disabled={loading}
                    activeOpacity={0.88}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : (
                            <View style={styles.checkoutBtnInner}>
                                <Text style={styles.checkoutBtnLabel}>Place Order</Text>
                                <View style={styles.checkoutAmtPill}>
                                    <Text style={styles.checkoutAmt}>₹{totalAmount}</Text>
                                </View>
                            </View>
                        )
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
    scroll: { padding: 20 },
    emptyEmoji: { fontSize: 64, marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#2D2D2D', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#AAA', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
    browseBtn: {
        backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16,
        shadowColor: PRIMARY, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 5,
    },
    browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#2D2D2D' },
    clearText: { color: '#E63946', fontWeight: '600', fontSize: 14 },
    cartItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
    },
    cartItemLeft: { flex: 1 },
    cartItemName: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    cartItemUnit: { fontSize: 12, color: '#AAA', marginTop: 3 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 12 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    },
    qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 20 },
    qtyNum: { fontSize: 16, fontWeight: '800', color: '#2D2D2D', minWidth: 20, textAlign: 'center' },
    cartItemTotal: { fontSize: 16, fontWeight: '800', color: PRIMARY, minWidth: 55, textAlign: 'right' },
    billCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
    },
    billTitle: { fontSize: 16, fontWeight: '800', color: '#2D2D2D', marginBottom: 14 },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billItemName: { fontSize: 13, color: '#666' },
    billItemAmt: { fontSize: 13, color: '#666', fontWeight: '600' },
    billDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    billFee: { fontSize: 13, color: '#AAA' },
    billFeeAmt: { fontSize: 13, fontWeight: '600' },
    billTotal: { fontSize: 16, fontWeight: '800', color: '#2D2D2D' },
    billTotalAmt: { fontSize: 18, fontWeight: '800', color: PRIMARY },
    infoCard: {
        backgroundColor: '#FFF8E7', borderRadius: 16, padding: 14, marginTop: 12, gap: 6,
    },
    infoText: { fontSize: 12, color: '#856404', lineHeight: 18 },
    checkoutBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 16, paddingBottom: 24,
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    checkoutBtn: {
        backgroundColor: PRIMARY, borderRadius: 16, height: 58,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: PRIMARY, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 5,
    },
    checkoutBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkoutBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 17 },
    checkoutAmtPill: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
    checkoutAmt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
