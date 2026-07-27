import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Colors } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      const donorData = JSON.parse(data);
      if (donorData.userId && donorData.bloodGroup) {
        Alert.alert(
          'Donor Verified',
          `Blood Group: ${donorData.bloodGroup}\nDo you want to proceed with this donor?`,
          [
            { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' },
            { 
              text: 'Confirm', 
              onPress: () => {
                // Here we would typically navigate to a form to log the donation
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error('Invalid QR Data');
      }
    } catch (e) {
      Alert.alert('Invalid QR Code', 'This QR code is not recognized by LifeLink.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Donor QR</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.scannerBox} />
        
        <Text style={styles.instructions}>
          Position the donor's QR code within the frame to verify their identity.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  instructions: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  }
});

export default QRScannerScreen;
