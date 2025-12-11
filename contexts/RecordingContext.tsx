// Recording Context
// Manages captured detections and notifications
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Audio, AVPlaybackStatusToSet } from 'expo-av';

export interface CapturedRecord {
  id: string;
  objectType: string; // e.g., "Human Detected", "Pest Detected", "Bird"
  timestamp: string;
  dateTime: string;
  imageUri?: string;
}

interface RecordingContextType {
  // Real-time records
  records: CapturedRecord[];
  addRecord: (record: CapturedRecord) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  
  // Saved records (moved from real-time)
  savedRecords: CapturedRecord[];
  saveRecord: (id: string) => void;
  removeSavedRecord: (id: string) => void;
  moveSavedToDeleted: (id: string) => void;
  
  // Deleted records (moved from real-time)
  deletedRecords: CapturedRecord[];
  moveToDeleted: (id: string) => void;
  removeDeletedRecord: (id: string) => void;
  restoreToSaved: (id: string) => void;
  clearDeletedRecords: () => void;
  
  // Notifications
  notifications: CapturedRecord[];
  hasNewNotification: boolean;
  removeNotification: (id: string) => void;
  clearNotification: () => void;
  playNotificationSound: () => void;

  // Alert preferences
  alertVolume: number; // 0-100 percentage
  setAlertVolume: (volume: number) => void;
  alertSoundUri: string | null;
  setAlertSoundUri: (uri: string | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within RecordingProvider');
  }
  return context;
};

interface RecordingProviderProps {
  children: ReactNode;
}

export const RecordingProvider: React.FC<RecordingProviderProps> = ({ children }) => {
  // Real-time records
  const [records, setRecords] = useState<CapturedRecord[]>([]);
  
  // Saved records (moved from real-time)
  const [savedRecords, setSavedRecords] = useState<CapturedRecord[]>([]);
  
  // Deleted records (moved from real-time)
  const [deletedRecords, setDeletedRecords] = useState<CapturedRecord[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<CapturedRecord[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Alert preferences
  const [alertVolume, setAlertVolume] = useState<number>(60); // Default 60%
  const [alertSoundUri, setAlertSoundUri] = useState<string | null>(null);

  const addRecord = (record: CapturedRecord) => {
    setRecords((prev) => [record, ...prev]); // Add to top
    
    // Add to notifications (persistent until manually removed)
    setNotifications((prev) => [record, ...prev]);
    setHasNewNotification(true);
    
    // Play notification sound
    playNotificationSound();
  };

  // Move record from real-time to deleted
  const moveToDeleted = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record) {
      setDeletedRecords((prev) => [record, ...prev]);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Move record from real-time to saved
  const saveRecord = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record) {
      setSavedRecords((prev) => [record, ...prev]);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Remove from saved records
  const removeSavedRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Move record from saved to deleted
  const moveSavedToDeleted = (id: string) => {
    const record = savedRecords.find((r) => r.id === id);
    if (record) {
      setDeletedRecords((prev) => [record, ...prev]);
      setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Remove from deleted records
  const removeDeletedRecord = (id: string) => {
    setDeletedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Restore deleted record to saved records
  const restoreToSaved = (id: string) => {
    const record = deletedRecords.find((r) => r.id === id);
    if (record) {
      setSavedRecords((prev) => [record, ...prev]);
      setDeletedRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Clear all deleted records
  const clearDeletedRecords = () => {
    setDeletedRecords([]);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const clearRecords = () => {
    setRecords([]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (updated.length === 0) {
        setHasNewNotification(false);
      }
      return updated;
    });
  };

  const clearNotification = () => {
    setHasNewNotification(false);
    setNotifications([]);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  const playNotificationSound = async () => {
    try {
      if (alertSoundUri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: alertSoundUri },
          { shouldPlay: true, volume: alertVolume / 100 }
        );
        
        // Auto-unload after playback completes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  };

  const value: RecordingContextType = {
    records,
    addRecord,
    deleteRecord,
    clearRecords,
    savedRecords,
    saveRecord,
    removeSavedRecord,
    moveSavedToDeleted,
    deletedRecords,
    moveToDeleted,
    removeDeletedRecord,
    restoreToSaved,
    clearDeletedRecords,
    notifications,
    hasNewNotification,
    removeNotification,
    clearNotification,
    playNotificationSound,
    alertVolume,
    setAlertVolume,
    alertSoundUri,
    setAlertSoundUri,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
};
