import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#81B29A';
const BG = '#FBF8F3';

export default function ChefProfileScreen({ navigation }) {
    const { user, userProfile, logout } = useAuth();

    const displayName = userProfile?.name || user?.email?.split('@')[0] || 'Chef';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout }
        ]);
    };

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
        : '—';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={ACCENT} />

            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: ACCENT }]}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <Text style={styles.heroName}>{displayName}</Text>
                <Text style={styles.heroEmail}>{user?.email}</Text>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>👨‍🍳 Home Chef</Text>
                </View>
            </View>

            {/* Chef Tips Card */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Chef Tips</Text>
                {[
                    'Update your menu daily with seasonal dishes',
                    'Good photos increase orders by 3×',
                    'Respond to orders quickly for better ratings',
                    'Keep your pickup address updated',
                ].map((tip, i) => (
                    <Text key={i} style={styles.tip}>→ {tip}</Text>
                ))}
            </View>

            {/* Account */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <InfoRow icon="📧" label="Email" value={user?.email} />
                <InfoRow icon="📅" label="Chef Since" value={memberSince} />
                <InfoRow icon="📍" label="Pickup Address" value={userProfile?.pickupAddress || 'Not set — edit profile to add'} />
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <MenuCard icon="✏️" label="Edit Kitchen Profile" sub="Name, address, phone" onPress={() => navigation.navigate('EditProfile')} />
                <MenuCard icon="🏦" label="Earnings & Payouts" sub="View your earnings history" onPress={() => Alert.alert('Coming Soon', 'Payout management coming soon!')} />
                <MenuCard icon="🔔" label="Order Notifications" sub="Get alerted for new orders" onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon!')} />
                <MenuCard icon="❓" label="Help & Support" sub="We're here to help" onPress={() => Alert.alert('Support', 'Email us at chefs@homesavour.in')} />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪  Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>HomeSavour v1.0.0 · Made with ❤️ in India</Text>
        </ScrollView>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{icon}</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );
}

function MenuCard({ icon, label, sub, onPress }) {
    return (
        <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.menuCardIcon}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
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
        marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '800' },
    heroName: { color: '#fff', fontSize: 24, fontWeight: '800' },
    heroEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
    heroBadge: {
        marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    },
    heroBadgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    tipsCard: {
        backgroundColor: '#F0F9F4', marginHorizontal: 20, marginTop: 20,
        borderRadius: 18, padding: 18, borderLeftWidth: 4, borderLeftColor: ACCENT,
    },
    tipsTitle: { fontSize: 14, fontWeight: '800', color: '#2D6A4F', marginBottom: 10 },
    tip: { fontSize: 13, color: '#444', lineHeight: 22 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
    infoRow: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
        borderRadius: 16, padding: 14, marginBottom: 8, gap: 12,
        shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    infoIcon: { fontSize: 20, marginTop: 2 },
    infoLabel: { fontSize: 11, color: '#AAA', fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#2D2D2D' },
    menuCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 14, marginBottom: 8,
        shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    menuCardIcon: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    menuCardLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
    menuCardSub: { fontSize: 12, color: '#AAA', marginTop: 2 },
    menuCardChevron: { fontSize: 22, color: '#CCC' },
    logoutBtn: {
        marginHorizontal: 20, marginTop: 28, borderRadius: 16, borderWidth: 1.5,
        borderColor: '#E63946', padding: 16, alignItems: 'center',
    },
    logoutText: { color: '#E63946', fontWeight: '700', fontSize: 16 },
    versionText: { textAlign: 'center', fontSize: 12, color: '#CCC', marginTop: 24, marginBottom: 40 },
});
