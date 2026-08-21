import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DashboardCard from '../components/DashboardCard';
import QuickActions from '../components/QuickActions';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to LifeLink</Text>
      <QuickActions />
      <DashboardCard type="emergency" onPress={() => navigation.navigate('Requests')} />
      <DashboardCard type="hospitals" onPress={() => navigation.navigate('Camps')} />
      <DashboardCard type="donationHistory" onPress={() => navigation.navigate('RequestHistory')} />
      <DashboardCard type="camps" onPress={() => navigation.navigate('Camps')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 16,
  },
});

export default HomeScreen;
