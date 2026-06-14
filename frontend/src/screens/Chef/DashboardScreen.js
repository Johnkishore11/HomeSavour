import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';

export default function ChefDashboardScreen({ navigation }) {
    const { user, userProfile } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${API_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }, timeout: 8000
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const pending = orders.filter(o => o.status === 'pending');
    const active  = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
    const today   = new Date();
    const todayEarnings = orders
        .filter(o => {
            const d = new Date(o.createdAt);
            return o.status === 'completed'
                && d.getDate() === today.getDate()
                && d.getMonth() === today.getMonth()
                && d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalEarnings = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const chefName = userProfile?.name || 'Chef';
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[PRIMARY]} />}
        >
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

            {/* Hero Header */}
            <View style={styles.hero}>
                <View>
                    <Text style={styles.greeting}>{greeting}, {chefName.split(' ')[0]}! 👨‍🍳</Text>
                    <Text style={styles.heroSub}>Your kitchen is {active.length > 0 ? '🔥 busy today' : '✨ ready for orders'}</Text>
                </View>
                <View style={styles.earningsPill}>
                    <Text style={styles.earningsPillLabel}>Today</Text>
                    <Text style={styles.earningsPillAmount}>₹{todayEarnings}</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatTile emoji="⏳" label="Pending" value={pending.length} color="#F4A261" onPress={() => navigation.navigate('ChefOrders')} />
                <StatTile emoji="🔥" label="Active" value={active.length} color={PRIMARY} onPress={() => navigation.navigate('ChefOrders')} />
                <StatTile emoji="💰" label="All Time" value={`₹${totalEarnings}`} color={ACCENT} />
                <StatTile emoji="📋" label="All Orders" value={orders.length} color="#6B9AC4" onPress={() => navigation.navigate('ChefOrders')} />
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <ActionCard
                        emoji="🍽️" label="Manage Menu" sub="Add, edit, hide dishes"
                        onPress={() => navigation.navigate('Menu')}
                    />
                    <ActionCard
                        emoji="📋" label="Orders"
                        sub={pending.length > 0 ? `${pending.length} pending!` : 'All clear'}
                        badge={pending.length}
                        onPress={() => navigation.navigate('ChefOrders')}
                    />
                </View>
            </View>

            {/* Pending Orders Preview */}
            {pending.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>🔔 Pending Orders</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ChefOrders')}>
                            <Text style={styles.seeAll}>View all →</Text>
                        </TouchableOpacity>
                    </View>
                    {pending.slice(0, 3).map(order => (
                        <TouchableOpacity
                            key={order._id}
                            style={styles.orderPreviewCard}
                            onPress={() => navigation.navigate('ChefOrders')}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.orderPendingDot]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.orderPreviewId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                                <Text style={styles.orderPreviewMeta}>
                                    {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.totalAmount}
                                </Text>
                            </View>
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingBadgeText}>Pending</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loading && <ActivityIndicator size="large" color={PRIMARY} style={{ margin: 30 }} />}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function StatTile({ emoji, label, value, color, onPress }) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
        <Wrapper style={[styles.statTile, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.statTileEmoji}>{emoji}</Text>
            <Text style={[styles.statTileValue, { color }]}>{value}</Text>
            <Text style={styles.statTileLabel}>{label}</Text>
        </Wrapper>
    );
}

function ActionCard({ emoji, label, sub, badge, onPress }) {
    return (
        <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.actionCardTop}>
                <Text style={styles.actionEmoji}>{emoji}</Text>
                {badge > 0 && (
                    <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
            <Text style={styles.actionSub}>{sub}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    hero: {
        backgroundColor: PRIMARY, padding: 24, paddingTop: 28, paddingBottom: 32,
        flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
    heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    earningsPill: {
        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16,
        paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center',
    },
    earningsPillLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
    earningsPillAmount: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },

    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginTop: 16,
    },
    statTile: {
        flexBasis: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3,
    },
    statTileEmoji: { fontSize: 24, marginBottom: 8 },
    statTileValue: { fontSize: 22, fontWeight: '800' },
    statTileLabel: { fontSize: 12, color: '#AAA', marginTop: 4, fontWeight: '600' },

    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#2D2D2D', marginBottom: 12 },
    seeAll: { color: PRIMARY, fontWeight: '700', fontSize: 13 },

    actionsGrid: { flexDirection: 'row', gap: 12 },
    actionCard: {
        flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
    },
    actionCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    actionEmoji: { fontSize: 34 },
    actionBadge: {
        backgroundColor: '#E63946', borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    actionBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    actionLabel: { fontSize: 15, fontWeight: '800', color: '#2D2D2D' },
    actionSub: { fontSize: 12, color: '#AAA', marginTop: 4 },

    orderPreviewCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 16, marginBottom: 8,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    orderPendingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F4A261', marginRight: 12 },
    orderPreviewId: { fontSize: 14, fontWeight: '700', color: '#2D2D2D' },
    orderPreviewMeta: { fontSize: 12, color: '#AAA', marginTop: 3 },
    pendingBadge: {
        backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    pendingBadgeText: { color: '#F4A261', fontWeight: '700', fontSize: 12 },
});
