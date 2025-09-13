import { useState, useEffect, useCallback } from 'react';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DriveEvent {
  id: string;
  type: 'traffic' | 'pothole' | 'weather' | 'speed_limit' | 'delivery_alert';
  message: string;
  location: GPSCoordinates;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

// Mock route: Delhi to Noida with multiple waypoints
const MOCK_ROUTE: GPSCoordinates[] = [
  { latitude: 28.6139, longitude: 77.2090, accuracy: 10, timestamp: Date.now() }, // Delhi
  { latitude: 28.6200, longitude: 77.2150, accuracy: 12, timestamp: Date.now() }, // Moving north
  { latitude: 28.6280, longitude: 77.2200, accuracy: 8, timestamp: Date.now() },  // Crossing Yamuna
  { latitude: 28.6350, longitude: 77.2280, accuracy: 15, timestamp: Date.now() }, // Entering Noida
  { latitude: 28.6420, longitude: 77.2350, accuracy: 10, timestamp: Date.now() }, // Sector 18
  { latitude: 28.6480, longitude: 77.2420, accuracy: 12, timestamp: Date.now() }, // Sector 62
  { latitude: 28.6550, longitude: 77.2500, accuracy: 8, timestamp: Date.now() },  // Final destination
];

const MOCK_EVENTS: Omit<DriveEvent, 'id' | 'timestamp' | 'location'>[] = [
  {
    type: 'traffic',
    message: 'Heavy traffic ahead on NH-24. Consider alternate route.',
    severity: 'high'
  },
  {
    type: 'pothole',
    message: 'Pothole detected 200m ahead. Drive carefully.',
    severity: 'medium'
  },
  {
    type: 'weather',
    message: 'Light rain expected. Reduce speed and maintain distance.',
    severity: 'medium'
  },
  {
    type: 'speed_limit',
    message: 'Speed limit 60 km/h. Current speed: 75 km/h.',
    severity: 'low'
  },
  {
    type: 'delivery_alert',
    message: 'Approaching delivery location. Prepare for next pickup.',
    severity: 'low'
  }
];

export function useGPSSimulation() {
  const [isActive, setIsActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GPSCoordinates | null>(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [events, setEvents] = useState<DriveEvent[]>([]);
  const [speed, setSpeed] = useState(45); // km/h

  // Simulate GPS position updates
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (routeIndex < MOCK_ROUTE.length) {
        const position = {
          ...MOCK_ROUTE[routeIndex],
          timestamp: Date.now()
        };
        
        setCurrentPosition(position);
        setRouteIndex(prev => prev + 1);
        
        // Randomly generate events
        if (Math.random() < 0.3) { // 30% chance of event
          const eventTemplate = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
          const newEvent: DriveEvent = {
            ...eventTemplate,
            id: Date.now().toString(),
            location: position,
            timestamp: Date.now()
          };
          
          setEvents(prev => [...prev, newEvent]);
        }
        
        // Simulate speed changes
        setSpeed(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 10)));
      } else {
        // Reset route for continuous simulation
        setRouteIndex(0);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isActive, routeIndex]);

  const startSimulation = useCallback(() => {
    setIsActive(true);
    setRouteIndex(0);
    setEvents([]);
    setCurrentPosition(MOCK_ROUTE[0]);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsActive(false);
    setCurrentPosition(null);
    setRouteIndex(0);
    setEvents([]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const markEventAsRead = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  return {
    isActive,
    currentPosition,
    events,
    speed,
    startSimulation,
    stopSimulation,
    clearEvents,
    markEventAsRead
  };
}