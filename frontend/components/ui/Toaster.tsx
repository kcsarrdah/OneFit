// frontend/components/ui/Toaster.tsx
import React from 'react';
import { View } from 'react-native';
import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </View>
  );
}