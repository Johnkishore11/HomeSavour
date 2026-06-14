import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#81B29A';
const BG = '#FBF8F3';

export default function EditProfileScreen({ navigation }) {
    const { userProfile, updateProfile } = useAuth();

    const [name, setName] = useState(userProfile?.name || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [pickupAddress, setPickupAddress] = useState(userProfile?.pickupAddress || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                name: name.trim(),
                phone: phone.trim(),
                pickupAddress: pickupAddress.trim(),
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Edit Profile</Text>
                    <Text style={styles.subtitle}>Update your kitchen details</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#AAA" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#AAA"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color="#AAA" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#AAA"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Pickup Address</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <Ionicons name="location-outline" size={20} color="#AAA" style={[styles.inputIcon, { marginTop: 12 }]} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Full pickup address for customers"
                                value={pickupAddress}
                                onChangeText={setPickupAddress}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                placeholderTextColor="#AAA"
                            />
                        </View>
                    </View>
                </View>

            </ScrollView>
            
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    scrollContent: { padding: 24, paddingBottom: 40 },
    header: { marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '800', color: '#2D2D2D', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#666' },
    formContainer: { gap: 20 },
    inputGroup: {},
    label: { fontSize: 13, fontWeight: '700', color: '#2D2D2D', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        paddingHorizontal: 16,
    },
    textAreaWrapper: { alignItems: 'flex-start' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 56, fontSize: 16, color: '#2D2D2D' },
    textArea: { height: 100, paddingTop: 16, paddingBottom: 16 },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#EAEAEA',
    },
    saveBtn: {
        backgroundColor: ACCENT,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ACCENT,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
