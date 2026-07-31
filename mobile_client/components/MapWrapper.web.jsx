import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style }) => (
  <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0D3D3', minHeight: 200 }, style]}>
    <Text style={{ color: '#6E6771', fontWeight: 'bold' }}>Map not supported on Web</Text>
    <Text style={{ color: '#6E6771', fontSize: 12, marginTop: 4 }}>Please use the iOS/Android app to view.</Text>
  </View>
);

export const Marker = () => null;
export const Callout = () => null;
export const Polyline = () => null;

export default MapView;
