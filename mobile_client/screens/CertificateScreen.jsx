import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import GlassCard from '../components/ui/GlassCard';
import { Colors } from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';
import { Award, Share2, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const CertificateScreen = ({ route }) => {
  const { donation } = route.params || {};
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just donated blood using LifeLink! Be a hero and donate today. Blood Type: ${user?.bloodGroup || 'Hero'} 🩸 #LifeLink`,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Certificate</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.certContainer}>
        <GlassCard style={styles.certificate}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeBg}>
              <Award size={48} color="#DC7609" />
            </View>
          </View>
          
          <Text style={styles.certTitle}>CERTIFICATE</Text>
          <Text style={styles.certSubtitle}>OF APPRECIATION</Text>

          <Text style={styles.proudlyPresented}>This certificate is proudly presented to</Text>
          
          <Text style={styles.donorName}>{user?.name || 'Life Saver'}</Text>
          <View style={styles.line} />
          
          <Text style={styles.certBody}>
            For your selfless act of donating blood on {donation?.date ? new Date(donation.date).toLocaleDateString() : new Date().toLocaleDateString()} 
            and helping save lives. Your contribution makes a difference.
          </Text>

          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signature}>LifeLink Team</Text>
              <View style={styles.sigLine} />
              <Text style={styles.sigLabel}>Authorized Signature</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.bloodGroupBadge}>{user?.bloodGroup || 'Blood'}</Text>
              <Text style={styles.sigLabel}>Blood Group</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Share2 size={20} color="#fff" />
        <Text style={styles.shareText}>Share Certificate</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  certContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  certificate: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    borderWidth: 8,
    borderColor: 'rgba(217, 45, 32, 0.1)',
    backgroundColor: '#fff',
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badgeBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF6E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC7609',
  },
  certTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    color: Colors.text,
  },
  certSubtitle: {
    fontSize: 16,
    letterSpacing: 2,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 30,
  },
  proudlyPresented: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  donorName: {
    fontSize: 26,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  line: {
    width: '80%',
    height: 1,
    backgroundColor: '#A79FA8',
    marginBottom: 20,
  },
  certBody: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  signatureBlock: {
    alignItems: 'center',
  },
  signature: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 5,
  },
  sigLine: {
    width: 100,
    height: 1,
    backgroundColor: '#000',
    marginBottom: 5,
  },
  sigLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  bloodGroupBadge: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default CertificateScreen;
