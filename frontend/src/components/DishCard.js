import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';

const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';

const CAT_COLORS = {
    Breakfast: '#FFF3CD',
    Lunch:     '#D4EDDA',
    Dinner:    '#CCE5FF',
    Snacks:    '#F8D7DA',
    Desserts:  '#E2CAF1',
    Other:     '#E2E3E5',
};
const CAT_TEXT = {
    Breakfast: '#856404',
    Lunch:     '#155724',
    Dinner:    '#004085',
    Snacks:    '#721C24',
    Desserts:  '#6F42C1',
    Other:     '#383D41',
};

const PLACEHOLDER_COLORS = ['#E07A5F', '#81B29A', '#3D405B', '#F2CC8F', '#6B9AC4'];

export default function DishCard({ dish, chefId, isChefView = false, onEdit, onDelete }) {
    const { addToCart, removeFromCart, cartItems } = useCart();
    const cartItem = cartItems.find(item => item._id === dish._id);
    const qty = cartItem ? cartItem.qty : 0;

    const placeholderBg = PLACEHOLDER_COLORS[(dish.name?.charCodeAt(0) || 0) % PLACEHOLDER_COLORS.length];
    const catBg = CAT_COLORS[dish.category] || CAT_COLORS.Other;
    const catText = CAT_TEXT[dish.category] || CAT_TEXT.Other;

    return (
        <View style={styles.card}>
            {/* Image */}
            {dish.imageUrl ? (
                <Image source={{ uri: dish.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: placeholderBg }]}>
                    <Text style={styles.imagePlaceholderText}>🍽️</Text>
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                {/* Category Badge + Availability */}
                <View style={styles.topRow}>
                    <View style={[styles.catBadge, { backgroundColor: catBg }]}>
                        <Text style={[styles.catBadgeText, { color: catText }]}>{dish.category}</Text>
                    </View>
                    {!dish.isAvailable && (
                        <View style={styles.unavailBadge}>
                            <Text style={styles.unavailText}>Unavailable</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{dish.description}</Text>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.price}>₹{dish.price}</Text>

                    {isChefView ? (
                        <View style={styles.chefActions}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => onEdit && onEdit(dish)}
                            >
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                            {onDelete && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => onDelete(dish)}
                                >
                                    <Text style={styles.deleteBtnText}>Del</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : dish.isAvailable ? (
                        qty > 0 ? (
                            <View style={styles.qtyRow}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => removeFromCart(dish._id)}
                                >
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyNum}>{qty}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => addToCart(dish, chefId)}
                                >
                                    <Text style={styles.qtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => addToCart(dish, chefId)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.addBtnText}>+ Add</Text>
                            </TouchableOpacity>
                        )
                    ) : null}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    image: { width: 112, height: 112 },
    imagePlaceholder: {
        width: 112, height: 112,
        alignItems: 'center', justifyContent: 'center',
    },
    imagePlaceholderText: { fontSize: 36 },
    content: { flex: 1, padding: 12, justifyContent: 'space-between' },
    topRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    catBadgeText: { fontSize: 10, fontWeight: '700' },
    unavailBadge: { backgroundColor: '#EEE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    unavailText: { fontSize: 10, fontWeight: '600', color: '#888' },
    name: { fontSize: 15, fontWeight: '800', color: '#2D2D2D', marginBottom: 2 },
    description: { fontSize: 12, color: '#AAA', lineHeight: 16, marginBottom: 6 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontSize: 17, fontWeight: '800', color: PRIMARY },
    addBtn: {
        backgroundColor: PRIMARY, paddingHorizontal: 16, paddingVertical: 7,
        borderRadius: 20,
        shadowColor: PRIMARY, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    },
    qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 20 },
    qtyNum: { fontSize: 15, fontWeight: '800', color: '#2D2D2D', minWidth: 20, textAlign: 'center' },
    chefActions: { flexDirection: 'row', gap: 6 },
    editBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1.5, borderColor: PRIMARY },
    editBtnText: { color: PRIMARY, fontWeight: '700', fontSize: 12 },
    deleteBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1.5, borderColor: '#E63946' },
    deleteBtnText: { color: '#E63946', fontWeight: '700', fontSize: 12 },
});
