import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, RefreshControl, Alert
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import DishCard from '../../components/DishCard';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';

export default function ChefMenuScreen({ route, navigation }) {
    const { chef } = route.params;
    const { user } = useAuth();
    const { totalItems, totalAmount } = useCart();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const token = await user.getIdToken();
                const res = await axios.get(`${API_URL}/dishes/chef/${chef._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDishes(res.data);
            } catch (err) {
                console.error('Failed to fetch dishes:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDishes();
    }, [chef._id, user]);

    const categories = ['All', ...new Set(dishes.map(d => d.category))];
    const filtered = activeCategory === 'All' ? dishes : dishes.filter(d => d.category === activeCategory);

    const AVATAR_COLORS = ['#E07A5F', '#81B29A', '#3D405B', '#F2CC8F', '#6B9AC4'];
    const avatarBg = AVATAR_COLORS[(chef.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

    return (
        <View style={styles.container}>
            {/* Chef Header */}
            <View style={[styles.chefHeader, { backgroundColor: avatarBg }]}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>{chef.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.chefName}>{chef.name}</Text>
                    <Text style={styles.chefSub}>📍 {chef.pickupAddress || 'Home Kitchen'}</Text>
                    {chef.rating > 0 && (
                        <Text style={styles.rating}>★ {chef.rating.toFixed(1)} · {chef.numReviews} reviews</Text>
                    )}
                </View>
            </View>

            {/* Category Filter */}
            {categories.length > 1 && (
                <View style={styles.catContainer}>
                    <FlatList
                        data={categories}
                        keyExtractor={c => c}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.catList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.catChip, activeCategory === item && styles.catChipActive]}
                                onPress={() => setActiveCategory(item)}
                            >
                                <Text style={[styles.catChipText, activeCategory === item && styles.catChipTextActive]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Dish List */}
            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🍳</Text>
                    <Text style={styles.emptyText}>No dishes available right now.</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <DishCard dish={item} chefId={chef._id} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Cart Bar */}
            {totalItems > 0 && (
                <TouchableOpacity
                    style={styles.cartBar}
                    onPress={() => navigation.navigate('Cart')}
                    activeOpacity={0.9}
                >
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{totalItems}</Text>
                    </View>
                    <Text style={styles.cartBarLabel}>View Cart</Text>
                    <Text style={styles.cartBarAmount}>₹{totalAmount} →</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBF8F3' },
    chefHeader: {
        flexDirection: 'row', alignItems: 'center', padding: 20,
        paddingTop: 28, gap: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    avatarCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
    },
    avatarLetter: { color: '#fff', fontSize: 28, fontWeight: '800' },
    chefName: { color: '#fff', fontSize: 20, fontWeight: '800' },
    chefSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3 },
    rating: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
    catContainer: { paddingVertical: 14 },
    catList: { paddingHorizontal: 16, gap: 8 },
    catChip: {
        paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E8E8E8',
    },
    catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    catChipText: { fontWeight: '600', fontSize: 13, color: '#888' },
    catChipTextActive: { color: '#fff' },
    list: { padding: 16, paddingBottom: 100 },
    emptyState: { flex: 1, alignItems: 'center', paddingTop: 80 },
    emptyEmoji: { fontSize: 52, marginBottom: 14 },
    emptyText: { fontSize: 15, color: '#888', textAlign: 'center' },
    cartBar: {
        position: 'absolute', bottom: 16, left: 16, right: 16,
        backgroundColor: PRIMARY, borderRadius: 18, padding: 18,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: PRIMARY, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 8,
    },
    cartBadge: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 10,
    },
    cartBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    cartBarLabel: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 16 },
    cartBarAmount: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
