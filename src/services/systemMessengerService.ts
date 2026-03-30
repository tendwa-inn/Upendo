import { supabase } from '../utils/supabase';

// Define the shape of a system message based on your new table
interface SystemMessage {
  title: string;
  message: string;
  type: string;
  target: string;
  photo_url?: string;
}

export const systemMessengerService = {
  /**
   * Sends a new system-wide notification.
   */
  async sendSystemMessage(message: SystemMessage) {
    const { data, error } = await supabase
      .from('notifications') // Corrected table
      .insert([{
        title: message.title,
        message: message.message,
        type: 'system', // Hardcoded as 'system'
        target: message.target, // e.g., 'all', 'pro', 'vip'
        photo_url: message.photo_url,
        // user_id is null for system-wide messages
      }]);

    if (error) {
      console.error('Error sending system message:', error);
      throw error;
    }

    return data;
  },

  /**
   * Retrieves all system messages from the notifications table.
   */
  async getSystemMessages() {
    const { data, error } = await supabase
      .from('notifications') // Corrected table
      .select('*')
      .eq('type', 'system') // Filter for system messages
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }

    return data;
  },
};
