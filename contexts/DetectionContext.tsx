// Global Detection Context
// Manages AI detection state across all screens
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  initializeDetectionModel, 
  detectObjects, 
  Detection,
  DetectionResult 
} from '../assets/services/detectionService';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface DetectionContextType {
  // Detection state
  detectionEnabled: boolean;
  detections: Detection[];
  hasHuman: boolean;
  hasPest: boolean;
  
  // Risk assessment
  riskLevel: RiskLevel;
  riskCondition: string;
  riskColor: string;
  
  // Controls
  toggleDetection: () => void;
  modelReady: boolean;
  
  // Callback for recording captures
  setOnObjectDetected?: (callback: (objectType: string, imageUri?: string) => void) => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within DetectionProvider');
  }
  return context;
};

interface DetectionProviderProps {
  children: React.ReactNode;
}

export const DetectionProvider: React.FC<DetectionProviderProps> = ({ children }) => {
  const [detectionEnabled, setDetectionEnabled] = useState<boolean>(true); // Auto-enabled
  const [detections, setDetections] = useState<Detection[]>([]);
  const [hasHuman, setHasHuman] = useState<boolean>(false);
  const [hasPest, setHasPest] = useState<boolean>(false);
  const [modelReady, setModelReady] = useState<boolean>(false);
  
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [riskCondition, setRiskCondition] = useState<string>('No Harm Detected');
  const [riskColor, setRiskColor] = useState<string>('#2ABD1D'); // Green
  
  const lastDetectionTimeRef = useRef<number>(0);
  const lastCaptureTimeRef = useRef<number>(0);
  const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const riskResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onObjectDetectedRef = useRef<((objectType: string, imageUri?: string) => void) | null>(null);

  // Initialize model on mount
  useEffect(() => {
    const loadModel = async () => {
      const ready = await initializeDetectionModel();
      setModelReady(ready);
      if (ready) {
        console.log('✅ Global AI Detection initialized and running');
      }
    };
    loadModel();
  }, []);

  // Check if it's nighttime/dawn (vulnerable hours)
  const isVulnerableTime = (): boolean => {
    const hour = new Date().getHours();
    // Nighttime: 6 PM - 5 AM (18:00 - 05:00)
    return hour >= 18 || hour < 5;
  };

  // Update risk level based on detections and time
  const updateRiskLevel = (detectedPest: boolean, detectedHuman: boolean) => {
    const vulnerable = isVulnerableTime();
    
    if (detectedPest) {
      setRiskLevel('HIGH');
      setRiskCondition('Pest Detected');
      setRiskColor('#EF4444'); // Red
      
      // Reset timer: back to LOW after 1 minute if no new detections
      if (riskResetTimerRef.current) {
        clearTimeout(riskResetTimerRef.current);
      }
      riskResetTimerRef.current = setTimeout(() => {
        if (vulnerable) {
          setRiskLevel('HIGH');
          setRiskCondition('No Harm Detected');
          setRiskColor('#F59E0B'); // Orange for vulnerable time
        } else {
          setRiskLevel('LOW');
          setRiskCondition('No Harm Detected');
          setRiskColor('#2ABD1D'); // Green
        }
      }, 60000); // 1 minute
      
    } else if (detectedHuman) {
      setRiskLevel('HIGH');
      setRiskCondition('Human Detected');
      setRiskColor('#EF4444'); // Red
      
      // Reset timer
      if (riskResetTimerRef.current) {
        clearTimeout(riskResetTimerRef.current);
      }
      riskResetTimerRef.current = setTimeout(() => {
        if (vulnerable) {
          setRiskLevel('HIGH');
          setRiskCondition('No Harm Detected');
          setRiskColor('#F59E0B'); // Orange
        } else {
          setRiskLevel('LOW');
          setRiskCondition('No Harm Detected');
          setRiskColor('#2ABD1D'); // Green
        }
      }, 60000);
      
    } else if (vulnerable) {
      // Nighttime/Dawn: Always HIGH but "No Harm Detected"
      setRiskLevel('HIGH');
      setRiskCondition('No Harm Detected');
      setRiskColor('#F59E0B'); // Orange for vulnerable time
      
    } else {
      // Daytime and clear
      setRiskLevel('LOW');
      setRiskCondition('No Harm Detected');
      setRiskColor('#2ABD1D'); // Green
    }
  };

  // Continuous detection loop
  useEffect(() => {
    if (!detectionEnabled || !modelReady) return;

    const runDetection = async () => {
      try {
        const result: DetectionResult = await detectObjects(undefined);
        
        setDetections(result.detections);
        setHasHuman(result.hasHuman);
        setHasPest(result.hasPest);
        lastDetectionTimeRef.current = result.timestamp;
        
        // Update risk level
        updateRiskLevel(result.hasPest, result.hasHuman);
        
        // Capture and record detection (throttled to once per 5 seconds)
        const now = Date.now();
        if ((result.hasPest || result.hasHuman) && now - lastCaptureTimeRef.current > 5000) {
          let objectType = 'Unknown Detected';
          
          if (result.hasPest) {
            const pestObjects = result.detections
              .filter(d => ['bird', 'crow', 'sparrow', 'pigeon', 'cat', 'dog', 'rat', 'mouse', 'squirrel', 'rabbit'].includes(d.class.toLowerCase()))
              .map(d => d.class);
            objectType = pestObjects.length > 0 ? `${pestObjects[0]} Detected` : 'Pest Detected';
          } else if (result.hasHuman) {
            objectType = 'Human Detected';
          }
          
          // Trigger recording callback
          if (onObjectDetectedRef.current) {
            onObjectDetectedRef.current(objectType);
          }
          
          lastCaptureTimeRef.current = now;
        }
        
        // Log detections
        if (result.detections.length > 0) {
          console.log('🎯 Active Detections:', result.detections.map(d => 
            `${d.class} (${Math.round(d.score * 100)}%)`
          ).join(', '));
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    // Start detection loop (every 3 seconds)
    runDetection(); // Run immediately
    detectionTimerRef.current = setInterval(runDetection, 3000);

    return () => {
      if (detectionTimerRef.current) {
        clearInterval(detectionTimerRef.current);
      }
    };
  }, [detectionEnabled, modelReady]);

  // Check vulnerable time periodically
  useEffect(() => {
    const checkVulnerableTime = setInterval(() => {
      // Re-evaluate risk level based on current time
      if (!hasPest && !hasHuman) {
        updateRiskLevel(false, false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkVulnerableTime);
  }, [hasPest, hasHuman]);

  const toggleDetection = () => {
    if (!modelReady) {
      console.warn('Model Not Ready - AI detection model is still loading...');
      return;
    }
    setDetectionEnabled(!detectionEnabled);
  };

  const setOnObjectDetected = (callback: (objectType: string, imageUri?: string) => void) => {
    onObjectDetectedRef.current = callback;
  };

  const value: DetectionContextType = {
    detectionEnabled,
    detections,
    hasHuman,
    hasPest,
    riskLevel,
    riskCondition,
    riskColor,
    toggleDetection,
    modelReady,
    setOnObjectDetected,
  };

  return (
    <DetectionContext.Provider value={value}>
      {children}
    </DetectionContext.Provider>
  );
};
