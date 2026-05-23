import type { PageServerLoad } from './$types';
import { getGlobalData, loadChallengeByDate, updateGlobalData } from '$lib/server/challenges';
import type { DailyMeta } from '$lib/interfaces';
import { calculateDays, getTodayDate } from '../params/date';
import { START_DATE_STRING } from '$lib/statics';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ fetch, platform }) => {
    const today = getTodayDate();

    const dailyMeta: DailyMeta | null = await loadChallengeByDate(fetch, today);
    if (!dailyMeta) {
        return {
            date: null,
            day: null,
            dailyMeta: null,
        };
    }

    const db = drizzle(platform?.env?.DB, { schema });
    const globalData = await getGlobalData(db, today);

    return {
        date: today,
        day: calculateDays(START_DATE_STRING, today),
        dailyMeta,
        globalData,
    };
};

export const actions = {
    saveScore: async ({ request, platform }) => {
        const today = getTodayDate();
        const data = await request.formData();
        const points = Number(data.get('points'));

        if (isNaN(points)) {
            return { success: false, error: 'Invalid points' };
        }

        const db = drizzle(platform?.env?.DB, { schema });
        await updateGlobalData(db, today, points);
        return { success: true };
    },
};
