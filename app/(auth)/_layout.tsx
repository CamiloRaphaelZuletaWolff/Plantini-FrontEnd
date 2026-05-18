import React, { useState, useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { ErrorModal } from '../../src/components';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AuthLayout() {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, error, clearError } = useAuthStore();

  // Escuchar cambios en el error del store. MUST stay above any conditional
  // return so the hook order is stable across renders — otherwise React
  // throws "Rendered fewer hooks than expected" when `user` flips truthy.
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  // Once Supabase fires onAuthStateChange with a session, the root layout
  // populates `user` in the store. From there this redirect kicks the user
  // out of the auth group into the main app — replaces the manual
  // router.replace() that used to live in login.tsx.
  if (user) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    clearError();
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
      
      {/* Modal de Error a nivel de Layout */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={handleCloseErrorModal}
      />
    </>
  );
}
