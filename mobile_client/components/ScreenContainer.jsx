import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, Platform, StatusBar } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/Theme';

const ScreenContainer = ({ children, scrollable = true, style }) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <Container
          style={[styles.container, style]}
          contentContainerStyle={scrollable ? styles.contentContainer : undefined}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(217, 45, 32, 0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(23, 92, 211, 0.06)',
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
