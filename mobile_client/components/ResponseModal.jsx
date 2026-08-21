import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';

const ResponseModal = ({ visible, onClose, onSubmit, request, submitting }) => {
  const [eta, setEta] = useState('');
  const [note, setNote] = useState('');

  const handleAccept = () => {
    if (!eta || isNaN(eta) || Number(eta) <= 0) {
      Alert.alert('Invalid ETA', 'Please enter a valid ETA greater than 0 minutes.');
      return;
    }
    onSubmit({ status: 'Accepted', eta: Number(eta).toString(), note });
  };
  const handleReject = () => {
    onSubmit({ status: 'Rejected', note });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Respond to Request</Text>
          <Text style={styles.label}>ETA (minutes)</Text>
          <TextInput
            style={styles.input}
            value={eta}
            onChangeText={setEta}
            keyboardType="numeric"
            placeholder="Estimated time to arrive"
          />
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Optional note"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.acceptBtn, submitting && styles.disabledBtn]} onPress={handleAccept} disabled={submitting}>
              <Text style={styles.btnText}>{submitting ? 'Submitting...' : 'Accept Request'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rejectBtn, submitting && styles.disabledBtn]} onPress={handleReject} disabled={submitting}>
              <Text style={styles.btnText}>{submitting ? 'Submitting...' : 'Reject Request'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={submitting}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: '85%',
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C81E4A',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#1D1B20',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0D3D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FBF7F6',
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
  },
  acceptBtn: {
    backgroundColor: '#0E9F6E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#C81E4A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  closeText: {
    color: '#2D6CDF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

export default ResponseModal;
