import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const PRIMARY = '#E07A5F';
const ACCENT = '#81B29A';
const BG = '#FBF8F3';

const AVATAR_COLORS = ['#E07A5F', '#81B29A', '#3D405B', '#F2CC8F', '#6B9AC4', '#D9A5B3'];

export default function CustomerProfileScreen({ navigation }) {
    const { user, userProfile, logout } = useAuth();
    const { clearCart } = useCart();

    const avatarColor = AVATAR_COLORS[(user?.email?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
    const displayName = userProfile?.name || user?.email?.split('@')[0] || 'Customer';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => { clearCart(); logout(); } }
        ]);
    };

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
        : '—';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={avatarColor} />

            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: avatarColor }]}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <Text style={styles.heroName}>{displayName}</Text>
                <Text style={styles.heroEmail}>{user?.email}</Text>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>Customer 🛒</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>Member</Text>
                    <Text style={styles.statSub}>{memberSince}</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <MenuCard
                    icon="✏️" label="Edit Profile"
                    sub="Update your name & details"
                    onPress={() => navigation.navigate('EditCustomerProfile')}
                />
                <MenuCard
                    icon="🔔" label="Notifications"
                    sub="Manage order alerts"
                    onPress={() => Alert.alert('Coming Soon', 'Notifications coming soon!')}
                />
                <MenuCard
                    icon="📍" label="Saved Addresses"
                    sub="Manage pickup preferences"
                    onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <MenuCard icon="❓" label="Help & FAQ" sub="Get answers to common questions" onPress={() => Alert.alert('Help', 'Support is available at support@homesavour.in')} />
                <MenuCard icon="⭐" label="Rate the App" sub="Love HomeSavour? Rate us!" onPress={() => Alert.alert('Thank you!', 'Ratings coming to the app store soon!')} />
                <MenuCard icon="📄" label="Terms & Privacy" sub="Legal stuff" onPress={() => Alert.alert('Terms', 'Full terms available at homesavour.in/terms')} />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪  Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>HomeSavour v1.0.0 · Made with ❤️ in India</Text>
        </ScrollView>
    );
}

function MenuCard({ icon, label, sub, onPress }) {
    return (
        <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.menuCardIcon}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
            </View>
            <View style={styles.menuCardBody}>
                <Text style={styles.menuCardLabel}>{label}</Text>
                <Text style={styles.menuCardSub}>{sub}</Text>
            </View>
            <Text style={styles.menuCardChevron}>›</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    hero: {
        alignItems: 'center', paddingTop: 48, paddingBottom: 36,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    },
    avatarCircle: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '800' },
    heroName: { color: '#fff', fontSize: 24, fontWeight: '800' },
    heroEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
    heroBadge: {
        marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    },
    heroBadgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    statsRow: {
        backgroundColor: '#fff', marginHorizontal: 20, marginTop: 20,
        borderRadius: 18, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10, elevation: 3,
        alignItems: 'center',
    },
    statItem: { alignItems: 'center' },
    statVal: { fontSize: 14, fontWeight: '700', color: '#2D2D2D' },
    statSub: { fontSize: 12, color: '#AAA', marginTop: 2 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
    menuCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 14, marginBottom: 8,
        shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    menuCardIcon: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    menuCardBody: { flex: 1 },
    menuCardLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    menuCardSub: { fontSize: 12, color: '#AAA', marginTop: 2 },
    menuCardChevron: { fontSize: 22, color: '#CCC', fontWeight: '300' },
    logoutBtn: {
        marginHorizontal: 20, marginTop: 28, borderRadius: 16, borderWidth: 1.5,
        borderColor: '#E63946', padding: 16, alignItems: 'center',
    },
    logoutText: { color: '#E63946', fontWeight: '700', fontSize: 16 },
    versionText: { textAlign: 'center', fontSize: 12, color: '#CCC', marginTop: 24, marginBottom: 40 },
});
