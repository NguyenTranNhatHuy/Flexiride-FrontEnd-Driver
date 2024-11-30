import axios from 'axios';

// Hàm tạo URL cho API VietMap
export const buildTSPUrl = (driverLocation, pickupPoints, apiKey) => {
  const baseUrl = 'https://maps.vietmap.vn/api/tsp?api-version=1.1';
  const apiKeyParam = `&apikey=${apiKey}`;
  const pointsParam = [driverLocation, ...pickupPoints]
    .map(point => `point=${point.latitude},${point.longitude}`)
    .join('&');
  const roundtripParam = '&roundtrip=true'; // Có vòng lặp
  return `${baseUrl}${apiKeyParam}&${pointsParam}${roundtripParam}`;
};

// Hàm gọi API VietMap
export const fetchOptimizedRoute = async (url) => {
  try {
    const response = await axios.get(url);
    if (response.data.code === 'OK') {
      return response.data;
    } else {
      throw new Error('API response error: ' + response.data.messages);
    }
  } catch (error) {
    console.error('Error fetching TSP route:', error);
    throw error;
  }
};
