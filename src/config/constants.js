// Configuration constants for networking listeners and storage.

export const CONFIG = {
    UDP: {
        PORT: 4000,
        HOST: '127.0.0.1',
        STATS_INTERVAL_MS: 1000,
    },
    TCP: {
        PORT: 7000,
        HOST: '127.0.0.1',
        OUTPUT_FILE: 'audit.log',
    },
};