import { supabase } from './supabaseClient';

export interface UserContext {
  firstName: string;
  lastName: string;
  dob: string;
  preferredLanguage: string;
  country: string;
  timezone: string;
  goals: string;
  interests: string[];
  profession: string;
  technicalLevel: string; // 'beginner' | 'intermediate' | 'advanced' | ''
  preferredResponseLanguage: string;
}

const LOCAL_STORAGE_KEY = 'petaw_user_context';

export const userUnderstandingService = {
  async getUserContext(userId: string): Promise<UserContext> {
    const fallback = this.getLocalFallback();
    if (!supabase) {
      return fallback;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, dob, preferences')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return fallback;
      }

      const prefs = data.preferences || {};
      const context: UserContext = {
        firstName: data.first_name || fallback.firstName,
        lastName: data.last_name || fallback.lastName,
        dob: data.dob || fallback.dob,
        preferredLanguage: prefs.preferredLanguage || fallback.preferredLanguage,
        country: prefs.country || fallback.country,
        timezone: prefs.timezone || fallback.timezone,
        goals: prefs.goals || fallback.goals,
        interests: prefs.interests || fallback.interests,
        profession: prefs.profession || fallback.profession,
        technicalLevel: prefs.technicalLevel || fallback.technicalLevel,
        preferredResponseLanguage: prefs.preferredResponseLanguage || fallback.preferredResponseLanguage,
      };

      // Sync local storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(context));
      return context;
    } catch (err) {
      console.warn('Error fetching user context from Supabase, returning local fallback:', err);
      return fallback;
    }
  },

  async updateUserContext(userId: string, partialContext: Partial<UserContext>): Promise<UserContext> {
    const current = await this.getUserContext(userId);
    const updated = { ...current, ...partialContext };

    // Update locally
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (!supabase) {
      return updated;
    }

    try {
      const dbUpdate: any = {};
      if (partialContext.firstName !== undefined) dbUpdate.first_name = partialContext.firstName;
      if (partialContext.lastName !== undefined) dbUpdate.last_name = partialContext.lastName;
      if (partialContext.dob !== undefined) dbUpdate.dob = partialContext.dob || null;

      const prefsUpdate: any = {};
      if (partialContext.preferredLanguage !== undefined) prefsUpdate.preferredLanguage = partialContext.preferredLanguage;
      if (partialContext.country !== undefined) prefsUpdate.country = partialContext.country;
      if (partialContext.timezone !== undefined) prefsUpdate.timezone = partialContext.timezone;
      if (partialContext.goals !== undefined) prefsUpdate.goals = partialContext.goals;
      if (partialContext.interests !== undefined) prefsUpdate.interests = partialContext.interests;
      if (partialContext.profession !== undefined) prefsUpdate.profession = partialContext.profession;
      if (partialContext.technicalLevel !== undefined) prefsUpdate.technicalLevel = partialContext.technicalLevel;
      if (partialContext.preferredResponseLanguage !== undefined) prefsUpdate.preferredResponseLanguage = partialContext.preferredResponseLanguage;

      // Fetch current preferences from DB to merge
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      const mergedPrefs = {
        ...(profile?.preferences || {}),
        ...prefsUpdate
      };

      await supabase
        .from('profiles')
        .update({
          ...dbUpdate,
          preferences: mergedPrefs,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    } catch (err) {
      console.warn('Error updating user context in Supabase:', err);
    }

    return updated;
  },

  getLocalFallback(): UserContext {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // ignore
      }
    }
    return {
      firstName: '',
      lastName: '',
      dob: '',
      preferredLanguage: 'fr',
      country: '',
      timezone: '',
      goals: '',
      interests: [],
      profession: '',
      technicalLevel: '',
      preferredResponseLanguage: 'fr'
    };
  },

  calculateCompleteness(context: UserContext, email?: string): number {
    const fields = [
      context.firstName,
      context.lastName,
      context.dob,
      context.preferredLanguage,
      context.country,
      context.timezone,
      context.goals,
      context.profession,
      context.technicalLevel,
      context.preferredResponseLanguage,
      context.interests && context.interests.length > 0 ? 'filled' : '',
      email || ''
    ];
    const filledCount = fields.filter(field => typeof field === 'string' ? field.trim() !== '' : Boolean(field)).length;
    return Math.round((filledCount / fields.length) * 100);
  }
};
