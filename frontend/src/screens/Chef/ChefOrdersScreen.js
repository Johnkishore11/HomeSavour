import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, RefreshControl, Alert, StatusBar
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';

const TABS = [
    { key: 'pending',  label: '⏳ Pending',  statuses: ['pending'] },
    { key: 'active',   label: '🔥 Active',   statuses: ['accepted', 'preparing'] },
    { key: 'ready',    label: '✅ Ready',    statuses: ['ready'] },
    { key: 'done',     label: '📦 Done',     statuses: ['completed', 'rejected'] },
];

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    bg: '#FFF3CD', text: '#856404' },
    accepted:   { label: 'Accepted',   bg: '#D1ECF1', text: '#0C5460' },
    preparing:  { label: 'Preparing',  bg: '#CCE5FF', text: '#004085' },
    ready:      { label: 'Ready! 🎉', bg: '#D4EDDA', text: '#155724' },
    completed:  { label: 'Completed',  bg: '#E2E3E5', text: '#383D41' },
    rejected:   { label: 'Rejected',   bg: '#F8D7DA', text: '#721C24' },
};

function OrderCard({ order, isChefView, onStatusUpdate }) {
    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const d = new Date(order.createdAt);
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
                <View>
                    <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderTime}>{dateStr} · {timeStr}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
            </View>

            <View style={styles.orderDivider} />

            {order.items.map((item, idx) => (
                <View key={idx} style={styles.orderItemRow}>
                    <Text style={styles.orderItemName} numberOfLines={1}>{item.name || `Dish #${idx + 1}`}</Text>
                    <Text style={styles.orderItemMeta}>×{item.qty} · ₹{item.price * item.qty}</Text>
                </View>
            ))}

            <View style={styles.orderDivider} />

            <View style={styles.orderFooter}>
                <Text style={styles.orderTotalLabel}>Total</Text>
                <Text style={styles.orderTotalAmount}>₹{order.totalAmount}</Text>
            </View>

            {/* Actions */}
            {isChefView && (
                <View style={styles.orderActions}>
                    {order.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: ACCENT }]}
                                onPress={() => onStatusUpdate(order._id, 'accepted')}
                            >
                                <Text style={styles.actionBtnText}>✓ Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#E63946' }]}
                                onPress={() => onStatusUpdate(order._id, 'rejected')}
                            >
                                <Text style={styles.actionBtnText}>✕ Reject</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {order.status === 'accepted' && (
                        <TouchableOpacity
                            style={[styles.actionBtnFull, { backgroundColor: PRIMARY }]}
                            onPress={() => onStatusUpdate(order._id, 'preparing')}
                        >
                            <Text style={styles.actionBtnText}>🍳 Start Preparing</Text>
                        </TouchableOpacity>
                    )}
                    {order.status === 'preparing' && (
                        <TouchableOpacity
                            style={[styles.actionBtnFull, { backgroundColor: ACCENT }]}
                            onPress={() => onStatusUpdate(order._id, 'ready')}
                        >
                            <Text style={styles.actionBtnText}>🔔 Mark Ready for Pickup</Text>
                        </TouchableOpacity>
                    )}
                    {order.status === 'ready' && (
                        <TouchableOpacity
                            style={[styles.actionBtnFull, { backgroundColor: '#3D405B' }]}
                            onPress={() => onStatusUpdate(order._id, 'completed')}
                        >
                            <Text style={styles.actionBtnText}>✅ Mark Completed</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

export default function ChefOrdersScreen() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');

    const fetchOrders = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${API_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${token}` }, timeout: 8000
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Chef orders error:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = await user.getIdToken();
            const res = await axios.put(
                `${API_URL}/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
        } catch (err) {
            Alert.alert('Error', 'Could not update order status.');
        }
    };

    const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses || [];
    const filtered = orders.filter(o => tabStatuses.includes(o.status));

    const countFor = (tab) => orders.filter(o => TABS.find(t => t.key === tab)?.statuses.includes(o.status)).length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* Tab Bar */}
            <View style={styles.tabBarWrap}>
                <ScrollHorizontal>
                    {TABS.map(tab => {
                        const count = countFor(tab.key);
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                                    {tab.label}
                                    {count > 0 ? ` (${count})` : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollHorizontal>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>
                        {activeTab === 'pending' ? '⏳' : activeTab === 'active' ? '🔥' : activeTab === 'ready' ? '🎉' : '📦'}
                    </Text>
                    <Text style={styles.emptyText}>No {activeTab} orders.</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <OrderCard order={item} isChefView onStatusUpdate={handleStatusUpdate} />
                    )}
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

function ScrollHorizontal({ children }) {
    const { ScrollView } = require('react-native');
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 4 }}>
            {children}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    tabBarWrap: {
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    tab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    tabActive: { backgroundColor: PRIMARY },
    tabText: { fontWeight: '600', fontSize: 13, color: '#888' },
    tabTextActive: { color: '#fff' },

    list: { padding: 16, paddingBottom: 30 },
    orderCard: {
        backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
    },
    orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: '800', color: '#2D2D2D' },
    orderTime: { fontSize: 12, color: '#AAA', marginTop: 3 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '700' },
    orderDivider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 10 },
    orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    orderItemName: { fontSize: 14, color: '#2D2D2D', flex: 1 },
    orderItemMeta: { fontSize: 14, color: '#888', marginLeft: 8, fontWeight: '600' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderTotalLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    orderTotalAmount: { fontSize: 18, fontWeight: '800', color: PRIMARY },
    orderActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
    actionBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnFull: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyText: { fontSize: 15, color: '#AAA', textAlign: 'center' },
});
