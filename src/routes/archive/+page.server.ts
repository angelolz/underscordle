import type { PageServerLoad } from './$types';
import { START_DATE_STRING } from '$lib/statics';
import { calculateDays } from '../../params/date';

export const load: PageServerLoad = async () => {
    const start = new Date(START_DATE_STRING);
    const dayOne = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
    );

    const today = new Date();
    const todayUtc = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const archiveEntries: { date: string; day: number }[] = [];
    const current = new Date(todayUtc);

    while (current >= dayOne) {
        const dateString = current.toISOString().split('T')[0];

        archiveEntries.push({
            date: dateString,
            day: calculateDays(START_DATE_STRING, dateString),
        });

        current.setUTCDate(current.getUTCDate() - 1);
    }

    return {
        archiveEntries,
    };
};
