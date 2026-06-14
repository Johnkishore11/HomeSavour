import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const STATUS_CONFIG = {
    pending:    { label: 'Pending',     bg: '#FFF3CD', text: '#856404' },
    accepted:   { label: 'Accepted',    bg: '#D1ECF1', text: '#0C5460' },
    preparing:  { label: 'Preparing',   bg: '#CCE5FF', text: '#004085' },
    ready:      { label: 'Ready! 🎉',   bg: '#D4EDDA', text: '#155724' },
    completed:  { label: 'Completed',   bg: '#E2E3E5', text: '#383D41' },
    rejected:   { label: 'Rejected',    bg: '#F8D7DA', text: '#721C24' },
};

export default function OrderCard({ order, isChefView = false, onStatusUpdate }) {
    const theme = useTheme();
    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.white }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.orderId, { color: theme.text }]}>
                    Order #{order._id.slice(-6).toUpperCase()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                </View>
            </View>

            <Text style={[styles.date, { color: theme.darkGray }]}>{formatDate(order.createdAt)}</Text>

            {/* Items */}
            <View style={styles.divider} />
            {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                        {item.name || item.dishId}
                    </Text>
                    <Text style={[styles.itemMeta, { color: theme.darkGray }]}>
                        x{item.qty}  ₹{item.price * item.qty}
                    </Text>
                </View>
            ))}
            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: theme.primary }]}>₹{order.totalAmount}</Text>
            </View>

            {/* Chef Actions */}
            {isChefView && order.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                        onPress={() => onStatusUpdate(order._id, 'accepted')}
                    >
                        <Text style={styles.actionBtnText}>✓ Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.red }]}
                        onPress={() => onStatusUpdate(order._id, 'rejected')}
                    >
                        <Text style={styles.actionBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isChefView && order.status === 'accepted' && (
                <TouchableOpacity
                    style={[styles.fullBtn, { backgroundColor: theme.primary }]}
                    onPress={() => onStatusUpdate(order._id, 'ready')}
                >
                    <Text style={styles.actionBtnText}>Mark as Ready for Pickup</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderId: {
        fontWeight: '700',
        fontSize: 15,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginVertical: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 13,
        flex: 1,
    },
    itemMeta: {
        fontSize: 13,
        marginLeft: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    totalLabel: {
        fontWeight: '700',
        fontSize: 15,
    },
    totalAmount: {
        fontWeight: '800',
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    actionBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    fullBtn: {
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 14,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
