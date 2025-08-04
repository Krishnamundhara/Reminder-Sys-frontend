// Session Heartbeat - keeps sessions alive while the app is active
import { useEffect } from 'react';
import { authService } from '../services/api';

// This component sends a heartbeat to the server every 4 minutes
// to keep the session alive as long as the app is open
const SessionHeartbeat = () => {
  useEffect(() => {
    // Function to ping the server
    const sendHeartbeat = async () => {
      try {
        console.log('Sending session heartbeat...');
        await authService.getAuthStatus();
        console.log('Heartbeat successful');
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    // Set up the heartbeat interval (every 4 minutes)
    const heartbeatInterval = setInterval(sendHeartbeat, 4 * 60 * 1000);
    
    // Initial heartbeat
    sendHeartbeat();
    
    // Clean up on unmount
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default SessionHeartbeat;
