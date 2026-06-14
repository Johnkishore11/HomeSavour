import React from 'react';
import { View, Text } from 'react-native';

export const Marker = () => null;
export const PROVIDER_DEFAULT = 'default';

const MapView = ({ children, style }) => (
    <View style={[{ backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }, style]}>
        <Text style={{ color: '#666', fontSize: 16 }}>Map view not supported on Web</Text>
    </View>
);

export default MapView;
