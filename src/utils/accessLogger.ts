
import { supabase } from "@/integrations/supabase/client";
import { TokenType } from "@/context/TokenContext";

// Simple location inference from IP (doesn't use geolocation API)
export const inferLocationFromIP = async (ip: string): Promise<any> => {
  try {
    // For privacy and simplicity, we're only using the first parts of the IP
    // to determine a very general location
    const ipParts = ip.split('.');
    const generalizedIP = ipParts.length >= 2 ? `${ipParts[0]}.${ipParts[1]}` : ip;
    
    // This would be a lookup to a proper IP database in production
    // Here we're just returning a placeholder
    return {
      city: "Unknown",
      country: "Unknown",
      region: generalizedIP.startsWith('192.168') ? 'Local Network' : 'External Network'
    };
  } catch (error) {
    console.error("Error inferring location:", error);
    return { city: "Unknown", country: "Unknown" };
  }
};

// Function to get device info from user agent
export const getDeviceInfo = (userAgent: string): string => {
  if (!userAgent) return "Unknown Device";
  
  // Very basic device detection
  if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    return "iOS Device";
  } else if (userAgent.includes("Android")) {
    return "Android Device";
  } else if (userAgent.includes("Windows")) {
    return "Windows Device";
  } else if (userAgent.includes("Mac")) {
    return "Mac Device";
  } else if (userAgent.includes("Linux")) {
    return "Linux Device";
  }
  
  return "Desktop Browser";
};

// Log token access (view or copy)
export const logTokenAccess = async (token: TokenType, accessType: 'view' | 'copy'): Promise<void> => {
  try {
    const { user_id, id } = token;
    
    // Get IP address (in a real app, this would come from a server)
    // For demo purposes we'll use a placeholder or fetch from an API
    const ipResponse = await fetch('https://api.ipify.org?format=json')
      .catch(() => ({ json: () => Promise.resolve({ ip: '127.0.0.1' }) }));
    const { ip } = await ipResponse.json();
    
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Get device name from user agent
    const deviceName = getDeviceInfo(userAgent);
    
    // Infer location data
    const locationData = await inferLocationFromIP(ip);
    
    // Log to Supabase
    const { error } = await supabase.from('token_access_logs').insert({
      token_id: id,
      user_id: user_id,
      access_type: accessType,
      ip_address: ip,
      user_agent: userAgent,
      device_name: deviceName,
      location_data: locationData
    });
    
    if (error) {
      console.error("Error logging token access:", error);
    }
  } catch (error) {
    console.error("Error in logTokenAccess:", error);
  }
};
