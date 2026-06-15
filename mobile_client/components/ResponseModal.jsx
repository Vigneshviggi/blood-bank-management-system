import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const ResponseModal = ({ visible, onClose, onSubmit, request }) => {
  const [eta, setEta] = useState('');
  const [note, setNote] = useState('');

  const handleAccept = () => {
    onSubmit({ status: 'Accepted', eta, note });
    setEta('');
    setNote('');
  };
  const handleReject = () => {
    onSubmit({ status: 'Rejected', note });
    setEta('');
    setNote('');
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
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
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
    color: '#e53935',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: '#43a047',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  rejectBtn: {
    backgroundColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
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
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ResponseModal;
