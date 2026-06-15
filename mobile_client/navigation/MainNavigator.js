import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserTabs from './UserTabs';
import HospitalTabs from './HospitalTabs';
import AdminTabs from './AdminTabs';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Theme';

const MainNavigator = () => {
  const { role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  switch (role) {
    case 'hospital':
      return <HospitalTabs />;
    case 'admin':
      return <AdminTabs />;
    case 'user':
    case 'donor':
    default:
      return <UserTabs />;
  }
};

export default MainNavigator;
