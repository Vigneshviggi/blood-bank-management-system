import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DashboardCard from '../components/DashboardCard';
import QuickActions from '../components/QuickActions';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to LifeLink</Text>
      <QuickActions />
      <DashboardCard type="emergency" />
      <DashboardCard type="hospitals" />
      <DashboardCard type="donationHistory" />
      <DashboardCard type="camps" />
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
