import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { loadSongCatalog, loadAlbumMap } from '$lib/server/challenges';
import { ERROR_LINES } from '$lib/statics';

export const load: LayoutServerLoad = async ({ fetch, route }) => {
    try {
        const [songList, albums] = await Promise.all([loadSongCatalog(fetch), loadAlbumMap(fetch)]);

        return {
            songList,
            albums,
            errorLine: route.id
                ? null
                : ERROR_LINES[Math.floor(Math.random() * ERROR_LINES.length)],
        };
    } catch (e) {
        console.error('Failed to load shared game data:', e);
        throw error(500, 'Failed to load essential game data');
    }
};
