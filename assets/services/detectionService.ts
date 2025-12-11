// AI Object Detection Service for Camera
// Detects humans and pests (birds, animals) using cloud-based detection
import axios from 'axios';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface Detection {
  class: string;
  score: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DetectionResult {
  detections: Detection[];
  hasHuman: boolean;
  hasPest: boolean;
  timestamp: number;
}

// Pest categories
const PEST_CLASSES = [
  'bird',
  'crow',
  'sparrow',
  'pigeon',
  'cat',
  'dog',
  'rat',
  'mouse',
  'squirrel',
  'rabbit',
];

const HUMAN_CLASSES = ['person', 'human'];

// Cloud API configuration - Using Roboflow with Microsoft COCO model
// This detects: person, bird, cat, dog, and other animals
const API_CONFIG = {
  useCloudAPI: true, // Enable cloud-based detection
  apiKey: 'rf_2IfYnKNBP3REUtQYEpFr6mC1m992',
  modelEndpoint: 'https://detect.roboflow.com/coco/3',
  confidence: 40, // Minimum confidence threshold (40%)
  overlap: 30, // Non-max suppression overlap threshold
};

let isModelReady = false;
let detectionMode: 'demo' | 'cloud' = 'demo';

export const initializeDetectionModel = async (): Promise<boolean> => {
  try {
    console.log('🤖 Detection model initialization started...');
    
    if (API_CONFIG.useCloudAPI) {
      // Using cloud API (Roboflow)
      detectionMode = 'cloud';
      console.log('✅ Using cloud-based AI detection (Roboflow COCO model)');
      console.log('📡 Detects: person, bird, cat, dog, and 77 other object classes');
    } else {
      // Use demo mode with simulated detections
      detectionMode = 'demo';
      console.log('🎮 Using demo detection mode (simulated)');
    }
    
    isModelReady = true;
    console.log('✅ Detection model ready');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize detection model:', error);
    return false;
  }
};

// Detect objects in camera frame
export const detectObjects = async (
  imageUri?: string
): Promise<DetectionResult> => {
  if (!isModelReady) {
    console.warn('Model not ready yet');
    return {
      detections: [],
      hasHuman: false,
      hasPest: false,
      timestamp: Date.now(),
    };
  }

  try {
    if (detectionMode === 'cloud' && imageUri) {
      // Cloud-based detection with actual image
      return await detectWithCloudAPI(imageUri);
    } else {
      // Demo mode: simulate random detections for testing
      return generateDemoDetections();
    }
  } catch (error) {
    console.error('Detection error:', error);
    return {
      detections: [],
      hasHuman: false,
      hasPest: false,
      timestamp: Date.now(),
    };
  }
};

// Cloud API detection using Roboflow
const detectWithCloudAPI = async (imageUri: string): Promise<DetectionResult> => {
  try {
    // Resize image for faster upload
    const resized = await manipulateAsync(
      imageUri,
      [{ resize: { width: 416 } }],
      { compress: 0.8, format: SaveFormat.JPEG, base64: true }
    );

    if (!resized.base64) {
      throw new Error('Failed to convert image to base64');
    }

    // Send to Roboflow API
    const url = `${API_CONFIG.modelEndpoint}?api_key=${API_CONFIG.apiKey}&confidence=${API_CONFIG.confidence}&overlap=${API_CONFIG.overlap}`;
    
    const response = await axios({
      method: 'POST',
      url: url,
      data: resized.base64,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.predictions) {
      console.warn('No predictions in response');
      return {
        detections: [],
        hasHuman: false,
        hasPest: false,
        timestamp: Date.now(),
      };
    }

    // Parse Roboflow response
    const detections: Detection[] = response.data.predictions.map((pred: any) => ({
      class: pred.class.toLowerCase(),
      score: pred.confidence,
      bbox: {
        x: (pred.x / pred.image_width) * 100,
        y: (pred.y / pred.image_height) * 100,
        width: (pred.width / pred.image_width) * 100,
        height: (pred.height / pred.image_height) * 100,
      },
    }));

    const hasHuman = detections.some(d => 
      HUMAN_CLASSES.includes(d.class) && d.score > 0.5
    );
    
    const hasPest = detections.some(d => 
      PEST_CLASSES.includes(d.class) && d.score > 0.5
    );

    return {
      detections,
      hasHuman,
      hasPest,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Cloud API detection error:', error);
    return {
      detections: [],
      hasHuman: false,
      hasPest: false,
      timestamp: Date.now(),
    };
  }
};

// Demo mode: generate random detections for testing
const generateDemoDetections = (): DetectionResult => {
  const random = Math.random();
  const detections: Detection[] = [];
  
  // 30% chance to detect a pest (for demo purposes)
  if (random < 0.3) {
    const pestTypes = ['bird', 'crow', 'cat', 'rat'];
    const pestType = pestTypes[Math.floor(Math.random() * pestTypes.length)];
    detections.push({
      class: pestType,
      score: 0.75 + Math.random() * 0.2,
      bbox: {
        x: 20 + Math.random() * 40,
        y: 20 + Math.random() * 40,
        width: 15 + Math.random() * 10,
        height: 15 + Math.random() * 10,
      },
    });
  }
  
  // 20% chance to detect a human
  if (random > 0.7) {
    detections.push({
      class: 'person',
      score: 0.85 + Math.random() * 0.1,
      bbox: {
        x: 30 + Math.random() * 30,
        y: 10 + Math.random() * 30,
        width: 20 + Math.random() * 15,
        height: 30 + Math.random() * 20,
      },
    });
  }

  const hasHuman = detections.some(d => HUMAN_CLASSES.includes(d.class));
  const hasPest = detections.some(d => PEST_CLASSES.includes(d.class));

  return {
    detections,
    hasHuman,
    hasPest,
    timestamp: Date.now(),
  };
};

// Get detection label with confidence
export const getDetectionLabel = (detection: Detection): string => {
  const confidence = Math.round(detection.score * 100);
  return `${detection.class} (${confidence}%)`;
};

// Check if detection is a threat (pest)
export const isThreatDetection = (detection: Detection): boolean => {
  return PEST_CLASSES.includes(detection.class) && detection.score > 0.5;
};

// Filter high-confidence detections
export const filterHighConfidenceDetections = (
  detections: Detection[],
  threshold: number = 0.5
): Detection[] => {
  return detections.filter(d => d.score >= threshold);
};
