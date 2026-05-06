import { getContext, setContext } from 'svelte';
import type { AppSettings } from './interfaces';

const SETTINGS_CONTEXT_KEY = 'app-settings';

export function setSettingsContext(settings: AppSettings) {
    setContext(SETTINGS_CONTEXT_KEY, settings);
    return settings;
}

export function getSettingsContext(): AppSettings | undefined {
    return getContext<AppSettings>(SETTINGS_CONTEXT_KEY);
}
