const REMINDER_SERVICE_URL = 'http://localhost:8085/api/reminders';

export const reminderService = {
  // Get system health
  async getHealth() {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminder health:', error);
      throw error;
    }
  },

  // Get statistics
  async getStatistics(days = 7) {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/statistics?days=${days}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminder statistics:', error);
      throw error;
    }
  },

  // Get reminder logs with pagination
  async getLogs(page = 0, size = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...filters
      });
      
      const response = await fetch(`${REMINDER_SERVICE_URL}/logs?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminder logs:', error);
      throw error;
    }
  },

  // Get specific reminder log by ID
  async getLogById(id) {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/logs/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminder log:', error);
      throw error;
    }
  },

  // Trigger manual reminder processing
  async triggerReminders() {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/trigger`, {
        method: 'POST'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error triggering reminders:', error);
      throw error;
    }
  },

  // Retry failed reminders
  async retryFailedReminders() {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/retry`, {
        method: 'POST'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error retrying failed reminders:', error);
      throw error;
    }
  },

  // Get system configuration
  async getConfig() {
    try {
      const response = await fetch(`${REMINDER_SERVICE_URL}/config`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminder config:', error);
      throw error;
    }
  }
};

// Utility functions for reminder data formatting
export const reminderUtils = {
  // Format status for display
  formatStatus(status) {
    switch (status) {
      case 'SENT':
        return { text: 'Sent', color: 'green' };
      case 'FAILED':
        return { text: 'Failed', color: 'red' };
      case 'PENDING':
        return { text: 'Pending', color: 'yellow' };
      default:
        return { text: status, color: 'gray' };
    }
  },

  // Format reminder type for display
  formatType(type) {
    switch (type) {
      case 'DUE_TOMORROW':
        return 'Due Tomorrow';
      case 'OVERDUE':
        return 'Overdue';
      default:
        return type?.replace('_', ' ') || 'Unknown';
    }
  },

  // Get status icon
  getStatusIcon(status) {
    switch (status) {
      case 'SENT':
        return 'CheckCircle';
      case 'FAILED':
        return 'XCircle';
      case 'PENDING':
        return 'Clock';
      default:
        return 'AlertTriangle';
    }
  },

  // Get type icon
  getTypeIcon(type) {
    switch (type) {
      case 'DUE_TOMORROW':
        return 'Calendar';
      case 'OVERDUE':
        return 'AlertTriangle';
      default:
        return 'Mail';
    }
  },

  // Format date for display
  formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  },

  // Format date for display (short version)
  formatDateShort(dateString) {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  },

  // Calculate retry status
  getRetryStatus(retryCount, maxRetries = 3) {
    if (retryCount === 0) {
      return { text: 'No retries', color: 'green' };
    } else if (retryCount < maxRetries) {
      return { text: `${retryCount} retries`, color: 'yellow' };
    } else {
      return { text: 'Max retries reached', color: 'red' };
    }
  }
};

export default reminderService;