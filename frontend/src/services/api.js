/**
 * Serviço de API para comunicação com o backend MindStats
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mindstats-backend.ondigitalocean.app/api'
  : 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Players
  async getPlayers(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/players?${queryString}` : '/players';
    
    return this.request(endpoint);
  }

  async getPlayerDetail(playerId, season = '2023/2024') {
    return this.request(`/players/${playerId}?season=${season}`);
  }

  // Top Performers
  async getTopPerformers(position = null, limit = 10, season = '2023/2024') {
    const params = new URLSearchParams({ limit, season });
    if (position) params.append('position', position);
    
    return this.request(`/top-performers?${params.toString()}`);
  }

  // Mental Nuclei
  async getMentalNuclei(season = '2023/2024') {
    return this.request(`/mental-nuclei?season=${season}`);
  }

  // Position Comparison
  async getPositionComparison(position, season = '2023/2024') {
    return this.request(`/position-comparison?position=${position}&season=${season}`);
  }

  // Teams
  async getTeams() {
    return this.request('/teams');
  }

  // Leagues
  async getLeagues() {
    return this.request('/leagues');
  }

  // Positions
  async getPositions() {
    return this.request('/positions');
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;

