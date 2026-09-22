import dgram from 'node:dgram';
import { CONFIG } from '../config/constants.js';

/**
 * Sends a high-speed burst of UDP datagrams simulating telemetry logs.
 * @param {number} packetCount - Total number of packets to transmit.
 */

export const sendUdpBurst = (packetCount = 5000) => {
    const client = dgram.createSocket('udp4');
    let packetsSent = 0;

    console.log(`[UDP Client] Starting burst of ${packetCount} datagrams to ${CONFIG.UDP.HOST}:${CONFIG.UDP.PORT}...`);

    const sendNext = () => {
        if (packetsSent >= packetCount) {
            console.log(`[UDP Client] Burst complete. Total datagrams dispatched: ${packetsSent}`);
            client.close();
            return;
        }

        const payload = Buffer.from(`METRIC_INFO: CPU_USAGE=${(Math.random() * 100).toFixed(2)}% DISK_IO=${Math.floor(Math.random() * 500)}MB/s`);
        packetsSent++;

        client.send(payload, CONFIG.UDP.PORT, CONFIG.UDP.HOST, (err) => {
            if (err) {
                console.error('[UDP Client Error]', err.message);
            }
        });

        // Schedule next iteration without blocking the Event Loop
        setImmediate(sendNext);
    };

    sendNext();
};