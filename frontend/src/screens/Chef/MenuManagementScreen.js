import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Modal, TextInput, Alert, ScrollView,
    Switch, RefreshControl, Image, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL_ANDROID;
const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';

const CATEGORIES = [
    { key: 'Breakfast', emoji: '🌅' },
    { key: 'Lunch', emoji: '☀️' },
    { key: 'Dinner', emoji: '🌙' },
    { key: 'Snacks', emoji: '🍿' },
    { key: 'Desserts', emoji: '🍮' },
    { key: 'Other', emoji: '🍴' },
];

const emptyForm = {
    name: '', description: '', price: '',
    imageUrl: '', category: 'Other', isAvailable: true
};

// Compact dish row used in manage menu
function DishRow({ dish, onEdit, onDelete, onToggle }) {
    const catEmoji = CATEGORIES.find(c => c.key === dish.category)?.emoji || '🍴';
    const placeholderBg = ['#E07A5F', '#81B29A', '#F2CC8F', '#6B9AC4', '#D9A5B3'];
    const bg = placeholderBg[(dish.name?.charCodeAt(0) || 0) % placeholderBg.length];

    return (
        <View style={styles.dishRow}>
            {/* Image / Avatar */}
            {dish.imageUrl ? (
                <Image source={{ uri: dish.imageUrl }} style={styles.dishRowImg} />
            ) : (
                <View style={[styles.dishRowImgPlaceholder, { backgroundColor: bg }]}>
                    <Text style={styles.dishRowImgText}>{catEmoji}</Text>
                </View>
            )}

            {/* Info */}
            <View style={styles.dishRowInfo}>
                <View style={styles.dishRowTop}>
                    <Text style={styles.dishRowName} numberOfLines={1}>{dish.name}</Text>
                    <Switch
                        value={dish.isAvailable}
                        onValueChange={() => onToggle(dish)}
                        trackColor={{ true: ACCENT, false: '#DDD' }}
                        thumbColor="#fff"
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
                <Text style={styles.dishRowCat}>{catEmoji} {dish.category}</Text>
                <View style={styles.dishRowBottom}>
                    <Text style={styles.dishRowPrice}>₹{dish.price}</Text>
                    <View style={styles.dishRowActions}>
                        <TouchableOpacity style={styles.editPill} onPress={() => onEdit(dish)}>
                            <Text style={styles.editPillText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deletePill} onPress={() => onDelete(dish)}>
                            <Text style={styles.deletePillText}>Del</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function MenuManagementScreen() {
    const { user } = useAuth();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filterCat, setFilterCat] = useState('ALL');

    const fetchDishes = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${API_URL}/dishes/chef/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDishes(res.data);
        } catch (err) {
            console.error('Fetch dishes error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchDishes(); }, [fetchDishes]);

    const openAddModal = () => {
        setEditingDish(null);
        setForm(emptyForm);
        setModalVisible(true);
    };

    const openEditModal = (dish) => {
        setEditingDish(dish);
        setForm({
            name: dish.name,
            description: dish.description,
            price: String(dish.price),
            imageUrl: dish.imageUrl || '',
            category: dish.category,
            isAvailable: dish.isAvailable,
        });
        setModalVisible(true);
    };

    const handleToggleAvailability = async (dish) => {
        try {
            const token = await user.getIdToken();
            await axios.put(`${API_URL}/dishes/${dish._id}`,
                { isAvailable: !dish.isAvailable },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDishes(prev => prev.map(d => d._id === dish._id ? { ...d, isAvailable: !d.isAvailable } : d));
        } catch (err) {
            Alert.alert('Error', 'Could not update dish availability.');
        }
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.description.trim() || !form.price) {
            Alert.alert('Missing Fields', 'Name, description, and price are required.');
            return;
        }
        if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid price.');
            return;
        }
        setSaving(true);
        try {
            const token = await user.getIdToken();
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                imageUrl: form.imageUrl.trim(),
                category: form.category,
                isAvailable: form.isAvailable,
            };

            if (editingDish) {
                const res = await axios.put(`${API_URL}/dishes/${editingDish._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDishes(prev => prev.map(d => d._id === editingDish._id ? res.data : d));
            } else {
                const res = await axios.post(`${API_URL}/dishes`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDishes(prev => [res.data, ...prev]);
            }
            setModalVisible(false);
        } catch (err) {
            console.error('Save dish error:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.message || 'Could not save dish.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (dish) => {
        Alert.alert(
            'Delete Dish',
            `Remove "${dish.name}" permanently?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await user.getIdToken();
                            await axios.delete(`${API_URL}/dishes/${dish._id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            setDishes(prev => prev.filter(d => d._id !== dish._id));
                        } catch (err) {
                            Alert.alert('Error', 'Could not delete dish.');
                        }
                    }
                }
            ]
        );
    };

    const availableCount = dishes.filter(d => d.isAvailable).length;
    const filteredDishes = filterCat === 'ALL'
        ? dishes
        : dishes.filter(d => d.category === filterCat);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} />

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{dishes.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: ACCENT }]}>{availableCount}</Text>
                    <Text style={styles.statLabel}>Available</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: '#E63946' }]}>{dishes.length - availableCount}</Text>
                    <Text style={styles.statLabel}>Hidden</Text>
                </View>
                <TouchableOpacity style={styles.addFab} onPress={openAddModal} activeOpacity={0.85}>
                    <Text style={styles.addFabText}>+ Add Dish</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                <TouchableOpacity
                    style={[styles.filterChip, filterCat === 'ALL' && styles.filterChipActive]}
                    onPress={() => setFilterCat('ALL')}
                >
                    <Text style={[styles.filterChipText, filterCat === 'ALL' && styles.filterChipTextActive]}>
                        All ({dishes.length})
                    </Text>
                </TouchableOpacity>
                {CATEGORIES.filter(cat => dishes.some(d => d.category === cat.key)).map(cat => (
                    <TouchableOpacity
                        key={cat.key}
                        style={[styles.filterChip, filterCat === cat.key && styles.filterChipActive]}
                        onPress={() => setFilterCat(cat.key)}
                    >
                        <Text style={[styles.filterChipText, filterCat === cat.key && styles.filterChipTextActive]}>
                            {cat.emoji} {cat.key}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Dish List */}
            {loading ? (
                <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 50 }} />
            ) : dishes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🍳</Text>
                    <Text style={styles.emptyTitle}>Your menu is empty</Text>
                    <Text style={styles.emptySub}>Start adding dishes so customers can find you!</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={openAddModal}>
                        <Text style={styles.emptyBtnText}>+ Add Your First Dish</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredDishes}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <DishRow
                            dish={item}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onToggle={handleToggleAvailability}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchDishes(); }}
                            colors={[PRIMARY]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptySub}>No dishes in this category.</Text>
                        </View>
                    }
                />
            )}

            {/* Add / Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {editingDish ? '✏️ Edit Dish' : '🍴 New Dish'}
                            </Text>
                            <TouchableOpacity
                                style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.modalSaveText}>Save</Text>
                                }
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.modalBody}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Image Preview */}
                            {form.imageUrl ? (
                                <Image
                                    source={{ uri: form.imageUrl }}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.imagePreviewPlaceholder}>
                                    <Text style={{ fontSize: 40 }}>🖼️</Text>
                                    <Text style={{ color: '#AAA', marginTop: 8 }}>Image preview</Text>
                                </View>
                            )}

                            {/* Form Fields */}
                            <FormField
                                label="Dish Name *"
                                value={form.name}
                                onChange={v => setForm(f => ({ ...f, name: v }))}
                                placeholder="e.g. Butter Chicken"
                            />

                            <FormField
                                label="Description *"
                                value={form.description}
                                onChange={v => setForm(f => ({ ...f, description: v }))}
                                placeholder="Describe taste, ingredients, portion..."
                                multiline
                            />

                            <FormField
                                label="Price (₹) *"
                                value={form.price}
                                onChange={v => setForm(f => ({ ...f, price: v }))}
                                placeholder="e.g. 120"
                                keyboardType="numeric"
                            />

                            <FormField
                                label="Image URL (optional)"
                                value={form.imageUrl}
                                onChange={v => setForm(f => ({ ...f, imageUrl: v }))}
                                placeholder="https://..."
                                autoCapitalize="none"
                            />

                            {/* Category */}
                            <Text style={styles.fieldLabel}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat.key}
                                        style={[
                                            styles.catCard,
                                            form.category === cat.key && styles.catCardActive
                                        ]}
                                        onPress={() => setForm(f => ({ ...f, category: cat.key }))}
                                    >
                                        <Text style={styles.catCardEmoji}>{cat.emoji}</Text>
                                        <Text style={[styles.catCardText, form.category === cat.key && styles.catCardTextActive]}>
                                            {cat.key}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Availability Toggle */}
                            <View style={styles.availRow}>
                                <View>
                                    <Text style={styles.availLabel}>Available for Order</Text>
                                    <Text style={styles.availSub}>
                                        {form.isAvailable ? 'Customers can order this' : 'Hidden from customers'}
                                    </Text>
                                </View>
                                <Switch
                                    value={form.isAvailable}
                                    onValueChange={v => setForm(f => ({ ...f, isAvailable: v }))}
                                    trackColor={{ true: ACCENT, false: '#DDD' }}
                                    thumbColor="#fff"
                                />
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

function FormField({ label, value, onChange, placeholder, multiline, keyboardType, autoCapitalize }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#BBB"
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                keyboardType={keyboardType || 'default'}
                autoCapitalize={autoCapitalize || 'sentences'}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },

    // Stats bar
    statsBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, marginBottom: 10,
        borderRadius: 18, paddingVertical: 14, paddingHorizontal: 20,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNum: { fontSize: 22, fontWeight: '800', color: '#2D2D2D' },
    statLabel: { fontSize: 11, color: '#AAA', marginTop: 2, fontWeight: '600' },
    statDivider: { width: 1, height: 36, backgroundColor: '#EEE' },
    addFab: {
        backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
        marginLeft: 16,
        shadowColor: PRIMARY, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4,
    },
    addFabText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Filters
    filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E8E8E8',
    },
    filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    filterChipText: { fontWeight: '600', fontSize: 13, color: '#888' },
    filterChipTextActive: { color: '#fff' },

    // Dish Row
    list: { paddingHorizontal: 16, paddingBottom: 30 },
    dishRow: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18,
        marginBottom: 10, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
    },
    dishRowImg: { width: 100, height: 100 },
    dishRowImgPlaceholder: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
    dishRowImgText: { fontSize: 36 },
    dishRowInfo: { flex: 1, padding: 12 },
    dishRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dishRowName: { fontSize: 14, fontWeight: '700', color: '#2D2D2D', flex: 1, marginRight: 4 },
    dishRowCat: { fontSize: 11, color: '#AAA', marginTop: 3, marginBottom: 6, fontWeight: '500' },
    dishRowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dishRowPrice: { fontSize: 16, fontWeight: '800', color: PRIMARY },
    dishRowActions: { flexDirection: 'row', gap: 6 },
    editPill: {
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
        borderWidth: 1.5, borderColor: PRIMARY,
    },
    editPillText: { color: PRIMARY, fontWeight: '700', fontSize: 12 },
    deletePill: {
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
        borderWidth: 1.5, borderColor: '#E63946',
    },
    deletePillText: { color: '#E63946', fontWeight: '700', fontSize: 12 },

    // Empty state
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D2D', marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#AAA', textAlign: 'center', lineHeight: 20 },
    emptyBtn: {
        marginTop: 24, backgroundColor: PRIMARY,
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
        shadowColor: PRIMARY, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4,
    },
    emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: BG },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    modalCancelBtn: { padding: 4 },
    modalCancelText: { color: '#888', fontSize: 15 },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#2D2D2D' },
    modalSaveBtn: {
        backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 8,
        borderRadius: 12, minWidth: 70, alignItems: 'center',
    },
    modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    modalBody: { padding: 20, paddingBottom: 60 },

    imagePreview: { width: '100%', height: 180, borderRadius: 16, marginBottom: 20 },
    imagePreviewPlaceholder: {
        height: 120, backgroundColor: '#F0F0F0', borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },

    // Form fields
    fieldWrap: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
    fieldInput: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14,
        fontSize: 15, color: '#2D2D2D', borderWidth: 1.5, borderColor: '#EEE',
    },
    fieldInputMulti: { height: 90, textAlignVertical: 'top' },

    // Category grid
    categoryGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
    },
    catCard: {
        flexBasis: '30%', paddingVertical: 12, borderRadius: 14,
        backgroundColor: '#fff', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#EEE',
    },
    catCardActive: { borderColor: PRIMARY, backgroundColor: '#FFF0EC' },
    catCardEmoji: { fontSize: 24, marginBottom: 4 },
    catCardText: { fontSize: 12, fontWeight: '600', color: '#888' },
    catCardTextActive: { color: PRIMARY },

    // Availability
    availRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1.5, borderColor: '#EEE',
    },
    availLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    availSub: { fontSize: 12, color: '#AAA', marginTop: 3 },
});
