import type { PageServerLoad } from './$types';
import { loadChallengeByDate } from '$lib/server/challenges';
import type { DailyMeta } from '$lib/interfaces';
import { calculateDays } from '../params/date';
import { START_DATE_STRING } from '$lib/statics';

export const load: PageServerLoad = async ({ fetch }) => {
    const today = new Date().toISOString().split('T')[0];

    const dailyMeta: DailyMeta | null = await loadChallengeByDate(fetch, today);
    if (!dailyMeta) {
        return {
            date: null,
            day: null,
            dailyMeta: null,
        };
    }

    return {
        date: today,
        day: calculateDays(START_DATE_STRING, today),
        dailyMeta,
    };
};
