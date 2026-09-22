import { createUdpServer } from './src/udp/udpServer.js';
import { createTcpServer } from './src/tcp/tcpServer.js';

/**
 * Main server entrypoint.
 * Initializes concurrent UDP (Metrics) and TCP (Audit) listeners.
 */
const startServer = () => {
    console.log('===================================================');
    console.log('🚀 Starting Centralised Log Ingestion Engine...');
    console.log('===================================================');

    // Initialize both transport listeners concurrently
    createUdpServer();
    createTcpServer();
};

// Global error handlers to prevent unhandled socket errors from crashing the process
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});

startServer();