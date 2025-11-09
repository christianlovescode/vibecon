/**
 * Instantly.ai API Service
 * Handles pushing leads to Instantly cold email platform
 */

export interface InstantlyLeadData {
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  website?: string;
  personalization?: string;
  list_id: string;
  skip_if_in_workspace?: boolean;
  skip_if_in_list?: boolean;
  custom_variables?: Record<string, any>;
}

export interface InstantlyResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class InstantlyService {
  private apiKey: string;
  private baseUrl = 'https://api.instantly.ai/api/v2';

  constructor() {
    this.apiKey = process.env.INSTANTLY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('INSTANTLY_API_KEY is not configured');
    }
  }

  /**
   * Push a lead to Instantly
   */
  async pushLead(leadData: InstantlyLeadData): Promise<InstantlyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `API error: ${response.status}`,
          data,
        };
      }

      return {
        success: true,
        message: 'Lead successfully pushed to Instantly',
        data,
      };
    } catch (error) {
      console.error('Instantly API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Verify API key is valid
   */
  async verifyApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/account/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('API key verification failed:', error);
      return false;
    }
  }
}
