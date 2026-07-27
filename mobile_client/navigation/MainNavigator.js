import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserTabs from './UserTabs';
import HospitalTabs from './HospitalTabs';
import AdminTabs from './AdminTabs';
import BloodBankTabs from './BloodBankTabs';
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
    case 'blood_bank':
      return <BloodBankTabs />;
    case 'admin':
    case 'super_admin':
      return <AdminTabs />;
    case 'user':
    case 'donor':
    case 'volunteer':
    default:
      return <UserTabs />;
  }
};

export default MainNavigator;
