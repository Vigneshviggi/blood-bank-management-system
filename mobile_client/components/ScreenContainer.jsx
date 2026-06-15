import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View, Platform, StatusBar } from 'react-native';
import { Colors } from '../constants/Theme';

const ScreenContainer = ({ children, scrollable = true, style }) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Container 
        style={[styles.container, style]} 
        contentContainerStyle={scrollable ? styles.contentContainer : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default ScreenContainer;
