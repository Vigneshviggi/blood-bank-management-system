import React from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../constants/Theme';

const ScreenContainer = ({ children, scrollable = true, style }) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.background}>
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />
          <Container
            style={[styles.container, style]}
            contentContainerStyle={scrollable ? styles.contentContainer : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </Container>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(200, 30, 74, 0.07)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(15, 155, 142, 0.07)',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 120,
  },
});

export default ScreenContainer;
