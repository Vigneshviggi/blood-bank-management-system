import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { BarChart3, FileText, Download, Calendar, Activity, Users } from 'lucide-react-native';

const ReportsScreen = () => {
  const handleDownload = (reportName) => {
    Alert.alert('Report Generated', `${reportName} has been generated and saved to your device.`);
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BarChart3 size={28} color={Colors.primary} />
          <Text style={styles.title}>System Reports</Text>
        </View>
        <Text style={styles.subtitle}>Generate and download comprehensive platform analytics.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <GlassCard style={styles.reportCard}>
          <View style={styles.reportIcon}>
            <Activity size={24} color={Colors.primary} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Emergency Requests Log</Text>
            <Text style={styles.reportDesc}>Detailed log of all emergency blood requests and fulfillment rates.</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload('Emergency Requests Log')}>
            <Download size={20} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.reportCard}>
          <View style={styles.reportIcon}>
            <Users size={24} color={Colors.accent} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Donor Registration Stats</Text>
            <Text style={styles.reportDesc}>Monthly statistics on new donor registrations and activity.</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload('Donor Stats')}>
            <Download size={20} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.reportCard}>
          <View style={styles.reportIcon}>
            <Calendar size={24} color={Colors.success} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Blood Camp Summary</Text>
            <Text style={styles.reportDesc}>Overview of all organized camps, attendees, and total units collected.</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload('Camp Summary')}>
            <Download size={20} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.reportCard}>
          <View style={styles.reportIcon}>
            <FileText size={24} color={Colors.warning} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Hospital Inventory Audit</Text>
            <Text style={styles.reportDesc}>Aggregated snapshot of current hospital stock levels and updates.</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload('Inventory Audit')}>
            <Download size={20} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  downloadBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default ReportsScreen;
