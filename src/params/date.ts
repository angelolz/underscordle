import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return false;

    const [year, month, day] = param.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export function calculateDays(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference;
}
