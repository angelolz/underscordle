import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isFutureChallengeDate, loadChallengeByDate } from '$lib/server/challenges';
import { calculateDays } from '../../params/date';
import { START_DATE_STRING } from '$lib/statics';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const date = params.date;

    if (isFutureChallengeDate(date)) {
        throw error(404, 'Challenge not found');
    }

    const dailyMeta = await loadChallengeByDate(fetch, date);
    if (!dailyMeta) {
        throw error(404, 'Challenge not found');
    }

    return {
        date,
        day: calculateDays(START_DATE_STRING, date),
        dailyMeta,
    };
};
