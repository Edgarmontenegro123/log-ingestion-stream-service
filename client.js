import { sendUdpBurst } from './src/client/udpClient.js';
import { streamTcpLogs } from './src/client/tcpClient.js';

const mode = process.argv[2];
const option = process.argv[3];

if (mode === 'udp') {
    const packetCount = option ? parseInt(option, 10) : 5000;
    sendUdpBurst(packetCount);
} else if (mode === 'tcp') {
    streamTcpLogs(option);
} else {
    console.log('===================================================');
    console.log('❌ Invalid execution mode.');
    console.log('===================================================');
    console.log('Usage examples:');
    console.log('  node client.js udp [packet_count]   (e.g., node client.js udp 5000)');
    console.log('  node client.js tcp [file_path]      (e.g., node client.js tcp sample.log)');
    console.log('===================================================');
    process.exit(1);
}