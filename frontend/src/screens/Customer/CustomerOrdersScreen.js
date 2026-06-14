import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';

const TABS = [
    { key: 'all',    label: 'All', statuses: null },
    { key: 'active', label: '🔥 Active', statuses: ['pending', 'accepted', 'preparing', 'ready'] },
    { key: 'past',   label: '📦 Past', statuses: ['completed', 'rejected'] },
];

const STATUS_CONFIG = {
    pending:   { label: 'Pending',    bg: '#FFF3CD', text: '#856404', emoji: '⏳' },
    accepted:  { label: 'Accepted',   bg: '#D1ECF1', text: '#0C5460', emoji: '✅' },
    preparing: { label: 'Preparing',  bg: '#CCE5FF', text: '#004085', emoji: '🍳' },
    ready:     { label: 'Ready! 🎉', bg: '#D4EDDA', text: '#155724', emoji: '🎉' },
    completed: { label: 'Completed',  bg: '#E2E3E5', text: '#383D41', emoji: '✔️' },
    rejected:  { label: 'Rejected',   bg: '#F8D7DA', text: '#721C24', emoji: '✕' },
};

function OrderCard({ order }) {
    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const d = new Date(order.createdAt);
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.cardDate}>{dateStr} · {timeStr}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={{ fontSize: 13 }}>{sc.emoji}</Text>
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            {order.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name || `Item ${i + 1}`}</Text>
                    <Text style={styles.itemMeta}>×{item.qty} · ₹{item.price * item.qty}</Text>
                </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.cardFooter}>
                <Text style={styles.footerTotal}>Total</Text>
                <Text style={styles.footerAmt}>₹{order.totalAmount}</Text>
            </View>

            {order.status === 'ready' && (
                <View style={styles.pickupBanner}>
                    <Text style={styles.pickupBannerText}>🎉 Your order is ready! Please pick it up from the chef.</Text>
                </View>
            )}
        </View>
    );
}

export default function CustomerOrdersScreen() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const fetchOrders = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${API_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }, timeout: 8000
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Fetch orders error:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses;
    const filtered = tabStatuses ? orders.filter(o => tabStatuses.includes(o.status)) : orders;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>📋</Text>
                    <Text style={styles.emptyTitle}>No orders {activeTab !== 'all' ? `in "${activeTab}"` : 'yet'}</Text>
                    <Text style={styles.emptySub}>Browse home chefs and place your first order!</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <OrderCard order={item} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
                            colors={[PRIMARY]}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    tabBar: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 8,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    tab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
    tabActive: { backgroundColor: PRIMARY },
    tabText: { fontWeight: '600', fontSize: 13, color: '#888' },
    tabTextActive: { color: '#fff' },
    list: { padding: 16, paddingBottom: 30 },
    card: {
        backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardId: { fontSize: 16, fontWeight: '800', color: '#2D2D2D' },
    cardDate: { fontSize: 12, color: '#AAA', marginTop: 3 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    statusText: { fontSize: 12, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 10 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    itemName: { fontSize: 13, color: '#444', flex: 1 },
    itemMeta: { fontSize: 13, color: '#888', fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerTotal: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    footerAmt: { fontSize: 18, fontWeight: '800', color: PRIMARY },
    pickupBanner: {
        marginTop: 12, backgroundColor: '#D4EDDA', borderRadius: 12, padding: 12,
    },
    pickupBannerText: { color: '#155724', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D2D', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#AAA', textAlign: 'center' },
});
