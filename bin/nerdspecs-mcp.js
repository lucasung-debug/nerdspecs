#!/usr/bin/env node
const { runMcpServer } = await import('../dist/mcp.js');
await runMcpServer();
