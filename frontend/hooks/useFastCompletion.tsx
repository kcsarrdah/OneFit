
import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface CompletedFastData {
  startTime: number;
  endTime: number;
  actualDurationSeconds: number;
  goalDurationSeconds: number;
}

interface FastToSave extends CompletedFastData {
  notes?: string;
}

// TODO: Move to config file
const API_BASE = __DEV__ ? 'http://localhost:3000' : 'https://your-api.com';

export function useFastCompletion() {
  const [showModal, setShowModal] = useState(false);
  const [completedFast, setCompletedFast] = useState<CompletedFastData | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Helper to format duration for display
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }, []);

  const openModal = useCallback((fastData: CompletedFastData) => {
    setCompletedFast(fastData);
    setNotes('');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setCompletedFast(null);
    setNotes('');
    setIsLoading(false);
  }, []);

  const saveFast = useCallback(async (userNotes?: string) => {
    if (!completedFast) return;
    
    setIsLoading(true);
    
    try {
      const fastToSave: FastToSave = {
        ...completedFast,
        notes: userNotes || notes
      };

      const response = await fetch(`${API_BASE}/api/fasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fastToSave),
        // Add timeout for better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to save fast: ${response.status}`);
      }

      toast({
        title: "Fast Saved!",
        description: `Your ${formatDuration(completedFast.actualDurationSeconds)} fast has been logged.`,
      });
      
      closeModal();
      
    } catch (error) {
      console.error('Failed to save fast:', error);
      
      const errorMessage = error instanceof Error && error.name === 'TimeoutError' 
        ? "Request timed out. Please check your connection and try again."
        : "Could not save your fast. Please try again.";
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [completedFast, notes, toast, closeModal, formatDuration]);

  const discardFast = useCallback(() => {
    toast({
      title: "Fast Discarded",
      description: "Your fast was not saved.",
    });
    closeModal();
  }, [toast, closeModal]);

  return {
    // State
    showModal,
    completedFast,
    notes,
    isLoading,
    
    // Actions
    openModal,
    closeModal,
    saveFast,
    discardFast,
    setNotes, // Simplified - no wrapper needed
  };
}