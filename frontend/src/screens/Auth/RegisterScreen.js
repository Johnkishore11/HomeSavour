import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    { key: 'customer', emoji: '🛒', label: 'Customer', sub: 'Browse & order food' },
    { key: 'chef', emoji: '👨‍🍳', label: 'Home Chef', sub: 'Cook & sell food' },
];

export default function RegisterScreen({ navigation }) {
    const { registerAndSaveToDatabase, setIsRegistering } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setIsRegistering(true);
        try {
            await registerAndSaveToDatabase(email.trim(), password, role, name.trim());
            Alert.alert('Welcome! 🎉', `Your ${role} account is ready.`);
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
            setIsRegistering(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Brand */}
                <View style={styles.brandWrap}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🍲</Text>
                    </View>
                    <Text style={styles.brandName}>HomeSavour</Text>
                    <Text style={styles.brandTagline}>Join our food community</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create account</Text>
                    <Text style={styles.cardSub}>Fill in the details to get started</Text>

                    {/* Role Selector */}
                    <Text style={styles.sectionLabel}>I want to...</Text>
                    <View style={styles.roleRow}>
                        {ROLES.map(r => (
                            <TouchableOpacity
                                key={r.key}
                                style={[
                                    styles.roleCard,
                                    role === r.key && styles.roleCardActive
                                ]}
                                onPress={() => setRole(r.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>
                                    {r.label}
                                </Text>
                                <Text style={[styles.roleSub, role === r.key && styles.roleSubActive]}>
                                    {r.sub}
                                </Text>
                                {role === r.key && (
                                    <View style={styles.roleCheck}>
                                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Inputs */}
                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>👤</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            placeholderTextColor="#AAA"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>📧</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#AAA"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Password (min 6 chars)"
                            placeholderTextColor="#AAA"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPass}
                        />
                        <TouchableOpacity onPress={() => setShowPass(s => !s)} style={styles.eyeBtn}>
                            <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDim]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>Create Account</Text>
                        }
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.switchRow}
                >
                    <Text style={styles.switchText}>
                        Already have an account?{'  '}
                        <Text style={styles.switchLink}>Sign in →</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const PRIMARY = '#E07A5F';
const BG = '#FBF8F3';

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: BG },
    container: { flexGrow: 1, padding: 24, justifyContent: 'center', paddingVertical: 40 },
    brandWrap: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
        shadowColor: PRIMARY, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 8,
    },
    logoEmoji: { fontSize: 34 },
    brandName: { fontSize: 28, fontWeight: '800', color: '#2D2D2D', letterSpacing: -0.5 },
    brandTagline: { fontSize: 13, color: '#999', marginTop: 4 },
    card: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 5,
    },
    cardTitle: { fontSize: 22, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
    cardSub: { fontSize: 14, color: '#999', marginBottom: 20 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 10 },
    roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    roleCard: {
        flex: 1, padding: 14, borderRadius: 16,
        backgroundColor: '#F5F5F5', alignItems: 'center',
        borderWidth: 2, borderColor: 'transparent',
        position: 'relative',
    },
    roleCardActive: { backgroundColor: '#FFF0EC', borderColor: PRIMARY },
    roleEmoji: { fontSize: 26, marginBottom: 6 },
    roleLabel: { fontWeight: '700', fontSize: 14, color: '#555' },
    roleLabelActive: { color: PRIMARY },
    roleSub: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 2 },
    roleSubActive: { color: '#C4654A' },
    roleCheck: {
        position: 'absolute', top: 8, right: 8,
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 14,
        paddingHorizontal: 14, marginBottom: 12, height: 54,
    },
    inputIcon: { fontSize: 18, marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#2D2D2D' },
    eyeBtn: { padding: 4 },
    eyeText: { fontSize: 18 },
    primaryBtn: {
        backgroundColor: PRIMARY, borderRadius: 14, height: 54,
        alignItems: 'center', justifyContent: 'center', marginTop: 6,
        shadowColor: PRIMARY, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 5,
    },
    primaryBtnDim: { opacity: 0.7 },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    switchRow: { marginTop: 28, alignItems: 'center' },
    switchText: { color: '#999', fontSize: 14 },
    switchLink: { color: PRIMARY, fontWeight: '700' },
});
