# Centralised Log Ingestion Engine (UDP & TCP Streams)

An asynchronous, memory-efficient log ingestion system built with Node.js core modules. Demonstrates transport layer protocols (UDP vs. TCP), stream pipelines with backpressure management, and line framing for fragmented sockets.

## Architecture & Design Patterns

```text
log-ingestion-stream-service/
├── src/
│   ├── config/
│   │   └── constants.js        # Centralised network ports and file paths
│   ├── tcp/
│   │   └── tcpServer.js        # TCP listener, readline framing, pipeline backpressure
│   ├── udp/
│   │   └── udpServer.js        # UDP datagram listener & metric ticker
│   └── client/
│       ├── udpClient.js        # High-speed UDP datagram burst emitter
│       └── tcpClient.js        # TCP stream client with drain event backpressure
├── server.js                   # Server orchestrator & global error handler
├── client.js                   # CLI entrypoint for test drivers
└── package.json
```

### Protocol Trade-offs
* **UDP (Port 4000):** Connectionless, low-overhead transport suited for non-critical metric and telemetry events. Packets are received as isolated datagrams via `node:dgram`.
* **TCP (Port 7000):** Stream-oriented, reliable transport for critical audit logs. Uses `node:net` to guarantee ordered delivery and avoid data loss.

### Technical Highlights
1. **Framing Mechanism:** TCP sockets process raw byte streams. Message boundaries are enforced using `readline.createInterface()` combined with an async generator (`async function*`) to split fragmented chunks into complete `\n`-delimited lines.
2. **Backpressure Control:** Data is processed through `pipeline()` from `node:stream/promises`. When disk write buffers fill up, TCP reads pause at socket level to restrict heap memory allocation below 50 MB.

---

## Prerequisites
* Node.js v18.0.0 or higher

## Execution Guide

### 1. Start Server
Run the server with standard heap memory limits:
```bash
npm start
```

### 2. Memory Stress Test (Evaluated Requirement)
To execute the server constrained strictly to a 50 MB V8 heap limit while ingesting >200 MB of continuous TCP data:
```bash
npm run stress-test
```

### 3. Run Client Drivers (In a Separate Terminal)

#### UDP Metrics Burst Simulation:
Sends 5,000 UDP datagrams in a rapid burst to port 4000:
```bash
node client.js udp 5000
```

#### TCP Heavy Audit Stream Simulation:
Generates and streams >200 MB of continuous audit logs to port 7000:

```Bash
node client.js tcp
```

#### TCP Local File Transmission:
Stream a specific log file to the server:

```Bash
node client.js tcp /path/to/logfile.log
```