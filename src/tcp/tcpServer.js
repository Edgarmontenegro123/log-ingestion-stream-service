import net from 'node:net'; // Create TCP server
import fs from 'node:fs'; // File system for persistence
import readline from 'node:readline'; // Native interface to solve the framing problem
import { pipeline } from 'node:stream/promises'; // Promised to chain Streams and control Backpressure without using callbacks
import { CONFIG } from '../config/constants.js';

/*
 Initializes and starts the TCP Listener for critical audit log ingestion.
 Ensures framing via newline delimiters and backpressure management via streams pipeline.
*/
export const createTcpServer = () => {
    // Create an appendable WriteStream to persist audit logs directly to disk
    const writeStream = fs.createWriteStream(CONFIG.TCP.OUTPUT_FILE, { flags: 'a' });

    const server = net.createServer(async (socket) => {
        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`[TCP] Client connected: ${clientAddress}`);

        try {
            // 1. Framing: Readline interface reconstructs fragmented TCP chunks into complete lines ending in \n
            const rl = readline.createInterface({
                input: socket,
                crlfDelay: Infinity,
            });

            // Generator function to append the newline character lost during readline parsing
            async function* lineGenerator() {
                for await (const line of rl) {
                    yield line + '\n';
                }
            }

            // 2. Backpressure: pipeline handles data flow and pauses socket reads when writeStream buffer is full
            await pipeline(lineGenerator, writeStream, { end: false });
        } catch (err) {
            if (err.code !== 'ECONNRESET') {
                console.error(`[TCP Error] Client ${clientAddress}:`, err.message);
            }
        } finally {
            console.log(`[TCP] Client disconnected: ${clientAddress}`);
        }
    });

    server.listen(CONFIG.TCP.PORT, () => {
        console.log(`[TCP] Server listening on port ${CONFIG.TCP.PORT}`);
    });

    return server;
};