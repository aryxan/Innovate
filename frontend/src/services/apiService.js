const API_BASE_URL = 'http://localhost:8000';

export const apiService = {
  /**
   * Fetch risk data for a specific state
   */
  async getStateRisk(stateName) {
    try {
      const response = await fetch(`${API_BASE_URL}/state-risk/${encodeURIComponent(stateName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching risk for ${stateName}:`, error);
      return null;
    }
  },

  /**
   * Fetch risk data for all states
   */
  async getAllStatesRisk() {
    try {
      const response = await fetch(`${API_BASE_URL}/states/all-risks`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.states || [];
    } catch (error) {
      console.error('Error fetching all states risk:', error);
      return [];
    }
  },

  /**
   * Check backend health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        return { status: 'offline', ai_model: 'inactive' };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: 'offline', ai_model: 'inactive' };
    }
  }
};

export default apiService;
