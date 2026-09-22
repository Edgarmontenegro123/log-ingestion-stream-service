import net from 'node:net';
import fs from 'node:fs';
import { CONFIG } from '../config/constants.js';

/**
 * Transmits audit logs over TCP stream to the central server.
 * Handles client-side backpressure using socket write buffering and the 'drain' event.
 * @param {string} [filePath] - Optional local file path to stream to server.
 */
export const streamTcpLogs = (filePath) => {
    const client = net.createConnection({ port: CONFIG.TCP.PORT, host: CONFIG.TCP.HOST }, () => {
        console.log(`[TCP Client] Connected to server at ${CONFIG.TCP.HOST}:${CONFIG.TCP.PORT}`);

        if (filePath && fs.existsSync(filePath)) {
            console.log(`[TCP Client] Streaming local file: ${filePath}`);
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(client);
        } else {
            console.log('[TCP Client] Generating continuous audit stream (>200MB test workload)...');

            // 3,000,000 lines of ~75 bytes each generate ~225MB of data
            const TOTAL_LINES = 3000000;
            let linesSent = 0;

            const writeBatch = () => {
                let isBufferAvailable = true;

                while (linesSent < TOTAL_LINES && isBufferAvailable) {
                    linesSent++;
                    const line = `[AUDIT_TRANSACTION] id=${linesSent} status=SUCCESS timestamp=${Date.now()}\n`;
                    isBufferAvailable = client.write(line);
                }

                if (linesSent < TOTAL_LINES) {
                    // Socket buffer is full; pause sending and wait for 'drain' event
                    client.once('drain', writeBatch);
                } else {
                    console.log(`[TCP Client] Stream completed. Total lines sent: ${linesSent}`);
                    client.end();
                }
            };

            writeBatch();
        }
    });

    client.on('end', () => {
        console.log('[TCP Client] Disconnected from server.');
    });

    client.on('error', (err) => {
        console.error('[TCP Client Error]', err.message);
    });
};