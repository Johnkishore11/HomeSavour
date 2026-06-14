import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Brand Header */}
                <View style={styles.brandWrap}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🍲</Text>
                    </View>
                    <Text style={styles.brandName}>HomeSavour</Text>
                    <Text style={styles.brandTagline}>Homemade food, made with love</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome back</Text>
                    <Text style={styles.cardSub}>Sign in to continue</Text>

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
                            placeholder="Password"
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
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>Sign In</Text>
                        }
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    style={styles.switchRow}
                >
                    <Text style={styles.switchText}>
                        Don't have an account?{'  '}
                        <Text style={styles.switchLink}>Create one →</Text>
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
    container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    brandWrap: { alignItems: 'center', marginBottom: 36 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: PRIMARY,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        shadowColor: PRIMARY,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },
    logoEmoji: { fontSize: 38 },
    brandName: { fontSize: 32, fontWeight: '800', color: '#2D2D2D', letterSpacing: -0.5 },
    brandTagline: { fontSize: 14, color: '#999', marginTop: 4 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        elevation: 5,
    },
    cardTitle: { fontSize: 22, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
    cardSub: { fontSize: 14, color: '#999', marginBottom: 24 },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        paddingHorizontal: 14,
        marginBottom: 14,
        height: 54,
    },
    inputIcon: { fontSize: 18, marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#2D2D2D' },
    eyeBtn: { padding: 4 },
    eyeText: { fontSize: 18 },
    primaryBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 14,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        shadowColor: PRIMARY,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 5,
    },
    primaryBtnDim: { opacity: 0.7 },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    switchRow: { marginTop: 28, alignItems: 'center' },
    switchText: { color: '#999', fontSize: 14 },
    switchLink: { color: PRIMARY, fontWeight: '700' },
});
