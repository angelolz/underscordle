import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return false;

    const [year, month, day] = param.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export function calculateDays(startDate: string, endDate: string) {
    const startPart = startDate.split('T')[0];
    const endPart = endDate.split('T')[0];

    const start = new Date(`${startPart}T00:00:00Z`);
    const end = new Date(`${endPart}T00:00:00Z`);

    const timeDifference = end.valueOf() - start.valueOf();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(daysDifference) + 1;
}

export function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
