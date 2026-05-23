import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
    getGlobalData,
    isFutureChallengeDate,
    loadChallengeByDate,
    updateGlobalData,
} from '$lib/server/challenges';
import { calculateDays } from '../../params/date';
import { START_DATE_STRING } from '$lib/statics';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params, fetch, platform }) => {
    const date = params.date;

    if (isFutureChallengeDate(date)) {
        throw error(404, 'Challenge not found');
    }

    const dailyMeta = await loadChallengeByDate(fetch, date);
    const db = drizzle(platform?.env?.DB, { schema });
    const globalData = await getGlobalData(db, date);

    return {
        date,
        day: calculateDays(START_DATE_STRING, date),
        dailyMeta,
        globalData,
    };
};

export const actions = {
    saveScore: async ({ params, request, platform }) => {
        const data = await request.formData();
        const points = Number(data.get('points'));

        if (isNaN(points)) {
            return { success: false, error: 'Invalid points' };
        }

        const db = drizzle(platform?.env?.DB, { schema });
        return await updateGlobalData(db, params.date, points);
    },
};
