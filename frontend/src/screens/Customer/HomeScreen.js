import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, TextInput, StatusBar
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../components/Map';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const DEFAULT_REGION = {
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.08,
    longitudeDelta: 0.04,
};

const COLORS = {
    primary: '#E07A5F',
    bg: '#FBF8F3',
    white: '#FFFFFF',
    text: '#2D2D2D',
    sub: '#888',
    card: '#FFFFFF',
    accent: '#81B29A',
};

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { totalItems } = useCart();
    const [chefs, setChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNearbyChefs = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(
                `${API_URL}/dishes/chefs/nearby?lat=${DEFAULT_REGION.latitude}&lng=${DEFAULT_REGION.longitude}`,
                { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
            );
            setChefs(res.data);
        } catch (err) {
            console.error('Fetch chefs error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchNearbyChefs(); }, [fetchNearbyChefs]);

    const filtered = chefs.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderChef = ({ item }) => (
        <TouchableOpacity
            style={styles.chefCard}
            onPress={() => navigation.navigate('ChefMenu', { chef: item })}
            activeOpacity={0.88}
        >
            <View style={[styles.chefAvatar, { backgroundColor: avatarColor(item.name) }]}>
                <Text style={styles.chefAvatarLetter}>{item.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={styles.chefCardBody}>
                <Text style={styles.chefCardName}>{item.name}</Text>
                <Text style={styles.chefCardAddress} numberOfLines={1}>
                    📍 {item.pickupAddress || 'Home Kitchen'}
                </Text>
                <View style={styles.ratingRow}>
                    <Text style={styles.star}>★</Text>
                    <Text style={styles.ratingText}>
                        {item.rating > 0 ? item.rating.toFixed(1) : 'New'}
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.ratingText}>Home Chef</Text>
                </View>
            </View>
            <View style={styles.chefCardArrow}>
                <Text style={{ color: COLORS.primary, fontSize: 18 }}>›</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Find a home cook 🍽️</Text>
                    <Text style={styles.headerSub}>Fresh, homemade food near you</Text>
                </View>
                {totalItems > 0 && (
                    <TouchableOpacity
                        style={styles.cartFloating}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Text style={styles.cartFloatingText}>🛒 {totalItems}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search chefs by name..."
                    placeholderTextColor="#BBB"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Map */}
            <View style={styles.mapWrap}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={DEFAULT_REGION}
                >
                    {filtered.map(chef =>
                        chef.location?.coordinates ? (
                            <Marker
                                key={chef._id}
                                coordinate={{
                                    latitude: chef.location.coordinates[1],
                                    longitude: chef.location.coordinates[0],
                                }}
                                title={chef.name}
                                description={chef.pickupAddress || 'Home Kitchen'}
                                pinColor={COLORS.primary}
                            />
                        ) : null
                    )}
                </MapView>
            </View>

            {/* Chef List */}
            <View style={styles.listSection}>
                <Text style={styles.listLabel}>
                    {filtered.length > 0 ? `${filtered.length} Chef${filtered.length > 1 ? 's' : ''} nearby` : 'No chefs found'}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🍳</Text>
                        <Text style={styles.emptyText}>No chefs nearby{searchQuery ? ` for "${searchQuery}"` : ''}.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item._id}
                        renderItem={renderChef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                    />
                )}
            </View>
        </View>
    );
}

const AVATAR_COLORS = ['#E07A5F', '#81B29A', '#3D405B', '#F2CC8F', '#6B9AC4', '#D9A5B3'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10,
    },
    greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    headerSub: { fontSize: 13, color: COLORS.sub, marginTop: 2 },
    cartFloating: {
        backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20,
        shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5,
    },
    cartFloatingText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, marginHorizontal: 20, marginBottom: 14,
        borderRadius: 16, paddingHorizontal: 14, height: 48,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
    mapWrap: {
        height: 200, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4,
        marginBottom: 20,
    },
    map: { width: '100%', height: '100%' },
    listSection: { flex: 1, paddingHorizontal: 20 },
    listLabel: { fontSize: 14, fontWeight: '700', color: COLORS.sub, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    chefCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
        borderRadius: 18, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
    },
    chefAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    chefAvatarLetter: { color: '#fff', fontSize: 22, fontWeight: '800' },
    chefCardBody: { flex: 1 },
    chefCardName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    chefCardAddress: { fontSize: 12, color: COLORS.sub, marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    star: { color: '#F2CC8F', fontSize: 14 },
    ratingText: { fontSize: 12, color: COLORS.sub },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CCC' },
    chefCardArrow: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#FFF0EC', alignItems: 'center', justifyContent: 'center',
    },
    emptyState: { alignItems: 'center', paddingTop: 40 },
    emptyEmoji: { fontSize: 44, marginBottom: 10 },
    emptyText: { color: COLORS.sub, fontSize: 14, textAlign: 'center' },
});
