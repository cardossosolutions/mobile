import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { DataProvider } from './src/contexts/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import ToastContainer from './src/components/common/ToastContainer';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppNavigator />
            <ToastContainer />
            <StatusBar style="auto" />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}