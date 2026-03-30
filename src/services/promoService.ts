import { supabase } from '../utils/supabase';
import { PromoCode } from '../types/admin';

export const promoService = {
  // Fetch all promo codes
  async getPromoCodes(): Promise<{ active: PromoCode[], expired: PromoCode[] }> {
    const { data: promos, error: promosError } = await supabase
      .from('promo_codes')
      .select('*');

    if (promosError) throw promosError;

    const { data: usage, error: usageError } = await supabase.rpc('get_promo_code_usage_counts');

    if (usageError) {
      console.error('RPC Error get_promo_code_usage_counts:', usageError);
      throw usageError;
    }

    const usageMap = new Map(usage.map(u => [u.promo_code_id, u.times_used]));

    const now = new Date();
    const active: PromoCode[] = [];
    const expired: PromoCode[] = [];

    promos.forEach(code => {
      const timesUsed = usageMap.get(code.id) || 0;
      const isExpired = new Date(code.expires_at) < now || (code.max_uses !== null && timesUsed >= code.max_uses);
      const promo = {
        ...code,
        times_used: timesUsed,
      };

      if (isExpired) {
        expired.push(promo);
      } else {
        active.push(promo);
      }
    });

    return { active, expired };
  },

  // Create a new promo code
  async createPromoCode(promoData: Partial<PromoCode>): Promise<PromoCode> {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([promoData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
