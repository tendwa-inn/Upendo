import { supabase } from '../utils/supabase';

export const profileService = {
  // Get a profile by its ID
  async getProfileById(profileId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('target_user_id')
      .eq('id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Record a profile view
  async recordProfileView(viewerId: string, viewedId: string) {
    const { error } = await supabase
      .from('profile_views')
      .insert({ viewer_id: viewerId, viewed_id: viewedId });

    if (error && error.code !== '23505') { // Ignore unique constraint violations
      console.error('Error recording profile view:', error);
    }
  },

  // Block a user
  async blockUser(blockerId: string, blockedId: string) {
    const { data, error } = await supabase
      .from('user_actions')
      .insert({ user_id: blockerId, target_user_id: blockedId, action_type: 'block' });

    if (error) throw error;
    return data;
  },

  // Create the system profile
  async createSystemProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: '00000000-0000-0000-0000-000000000000', name: 'Upendo', role: 'system' }]);

    if (error) throw error;
    return data;
  },

  // Get profiles for the discover page, excluding the system user and blocked users
  async getDiscoverProfiles(currentUserId: string) {
    // First get the list of users that the current user has blocked
    const { data: blockedUsers } = await supabase
      .from('user_actions')
      .select('target_user_id')
      .eq('user_id', currentUserId)
      .eq('action_type', 'block');

    const blockedUserIds = blockedUsers?.map(action => action.target_user_id) || [];

    const { data: viewedProfiles } = await supabase
      .from('profile_views')
      .select('viewed_id')
      .eq('viewer_id', currentUserId);

    const viewedProfileIds = viewedProfiles?.map(view => view.viewed_id) || [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'eq', 'system')
      .not('is_blocked', 'eq', true)
      .not('id', 'eq', currentUserId)
      .not('id', 'in', `(${[...blockedUserIds, ...viewedProfileIds].join(',')})`)
      .not('photos', 'is', null)
      .not('photos', 'eq', '{}');

    if (error) throw error;
    return data;
  },

  // Update a profile
  async updateProfile(profileId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) throw error;
    return data;
  },

  // Search for profiles by name
  async searchProfiles(searchTerm: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,name,dob,photos')
      .ilike('name', `%${searchTerm}%`)
      .not('role', 'eq', 'system');

    if (error) throw error;
    return data;
  },

  // Get all profiles
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('role', 'eq', 'system');

    if (error) throw error;
    return data;
  },

  // Delete a profile
  async deleteProfile(profileId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return data;
  },

  // Block a profile
  async blockProfile(profileId: string) {
    return await this.updateProfile(profileId, { is_blocked: true });
  },

  // Unblock a profile
  async unblockProfile(profileId: string) {
    return await this.updateProfile(profileId, { is_blocked: false });
  },

  // Get dormant profiles
  async getDormantProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_deactivated', true);

    if (error) throw error;
    return data;
  },
};
