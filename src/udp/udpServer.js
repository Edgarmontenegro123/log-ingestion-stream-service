import dgram from 'node:dgram';
import { CONFIG } from '../config/constants.js';

// Initializes and starts the UDP Listener for telemetry/metrics ingestion.

export const createUdpServer = () => {
    const socket = dgram.createSocket('udp4');

    let totalPackets = 0;
    let packetsInCurrentSecond = 0;

    // Event fired when a UDP datagram arrives
    socket.on('message', () => {
        totalPackets++;
        packetsInCurrentSecond++;
    });

    // Event fired when the UDP socket is bound and listening
    socket.on('listening', () => {
        const address = socket.address();
        console.log(`[UDP] Server listening on ${address.address}:${address.port}`);
    });

    // Periodic metrics report to stdout
    setInterval(() => {
        console.log(`[UDP Stats] Rate: ${packetsInCurrentSecond} pkg/s | Total received: ${totalPackets}`);
        packetsInCurrentSecond = 0;
    }, CONFIG.UDP.STATS_INTERVAL_MS);

    // Bind (link) the socket to the configured port
    socket.bind(CONFIG.UDP.PORT);

    return socket;
};