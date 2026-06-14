import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

// Auth
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Customer
import HomeScreen from '../screens/Customer/HomeScreen';
import ChefMenuScreen from '../screens/Customer/ChefMenuScreen';
import CartScreen from '../screens/Customer/CartScreen';
import CustomerOrdersScreen from '../screens/Customer/CustomerOrdersScreen';
import ProfileScreen from '../screens/Customer/ProfileScreen';
import EditCustomerProfileScreen from '../screens/Customer/EditCustomerProfileScreen';

// Chef
import DashboardScreen from '../screens/Chef/DashboardScreen';
import MenuManagementScreen from '../screens/Chef/MenuManagementScreen';
import ChefOrdersScreen from '../screens/Chef/ChefOrdersScreen';
import ChefProfileScreen from '../screens/Chef/ChefProfileScreen';
import EditProfileScreen from '../screens/Chef/EditProfileScreen';

import { useCart } from '../context/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ----- AUTH STACK -----
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

// ----- CUSTOMER TABS + STACK -----
const CustomerTabs = () => {
    const theme = useTheme();
    const { totalItems } = useCart();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: theme.primary },
                headerTintColor: theme.white,
                headerTitleStyle: { fontWeight: '700' },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.darkGray,
                tabBarStyle: {
                    backgroundColor: theme.white,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowOpacity: 0.1,
                    height: 62,
                    paddingBottom: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Home: focused ? 'home' : 'home-outline',
                        Cart: focused ? 'cart' : 'cart-outline',
                        Orders: focused ? 'receipt' : 'receipt-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    };
                    return <Ionicons name={icons[route.name]} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Nearby Chefs' }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    title: 'My Cart',
                    tabBarBadge: totalItems > 0 ? totalItems : undefined,
                    tabBarBadgeStyle: { backgroundColor: theme.primary },
                }}
            />
            <Tab.Screen
                name="Orders"
                component={CustomerOrdersScreen}
                options={{ title: 'My Orders' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

// Customer flow wraps tabs + chef menu detail screen
const CustomerStack = () => {
    const theme = useTheme();
    return (
        <Stack.Navigator>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} options={{ headerShown: false }} />
            <Stack.Screen
                name="ChefMenu"
                component={ChefMenuScreen}
                options={({ route }) => ({
                    title: route.params?.chef?.name || 'Chef Menu',
                    headerStyle: { backgroundColor: theme.primary },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                })}
            />
            <Stack.Screen
                name="EditCustomerProfile"
                component={EditCustomerProfileScreen}
                options={{
                    title: 'Edit Profile',
                    headerStyle: { backgroundColor: theme.primary },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                }}
            />
        </Stack.Navigator>
    );
};

// ----- CHEF TABS + STACK -----
const ChefTabs = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: theme.accent },
                headerTintColor: theme.white,
                headerTitleStyle: { fontWeight: '700' },
                tabBarActiveTintColor: theme.accent,
                tabBarInactiveTintColor: theme.darkGray,
                tabBarStyle: {
                    backgroundColor: theme.white,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowOpacity: 0.1,
                    height: 62,
                    paddingBottom: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = {
                        Dashboard: focused ? 'grid' : 'grid-outline',
                        Menu: focused ? 'restaurant' : 'restaurant-outline',
                        ChefOrders: focused ? 'receipt' : 'receipt-outline',
                        ChefProfile: focused ? 'person' : 'person-outline',
                    };
                    return <Ionicons name={icons[route.name]} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen
                name="Menu"
                component={MenuManagementScreen}
                options={{ title: 'My Menu' }}
            />
            <Tab.Screen
                name="ChefOrders"
                component={ChefOrdersScreen}
                options={{ title: 'Orders' }}
            />
            <Tab.Screen
                name="ChefProfile"
                component={ChefProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

// Chef flow wraps tabs + edit profile screen
const ChefStack = () => {
    const theme = useTheme();
    return (
        <Stack.Navigator>
            <Stack.Screen name="ChefTabs" component={ChefTabs} options={{ headerShown: false }} />
            <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen} 
                options={{ 
                    title: 'Edit Profile',
                    headerStyle: { backgroundColor: theme.accent },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700' },
                }} 
            />
        </Stack.Navigator>
    );
};

// ----- ROOT -----
export default function RootNavigator() {
    const { user, userProfile, role, loading, isRegistering } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F1DE' }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#E07A5F' }}>HomeSavour</Text>
                <Text style={{ color: '#A0A0A0', marginTop: 8 }}>Loading...</Text>
            </View>
        );
    }

    // Keep the Auth stack mounted during manual registration
    if (!user || isRegistering) return <AuthStack />;

    // Wait for the backend profile to sync if it's missing but we know they're not registering right now
    if (!userProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F1DE' }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#E07A5F' }}>HomeSavour</Text>
                <Text style={{ color: '#A0A0A0', marginTop: 8 }}>Completing sign in...</Text>
            </View>
        );
    }

    if (role === 'chef') return <ChefStack />;
    return <CustomerStack />;
}
