import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { registerSearchTool, registerSourceTools } from 'fumadocs-core/mcp';
import { docsLlms, source } from '@/lib/source';
import { searchServer } from '@/lib/search';
import { appName } from '@/lib/shared';

const handler = createMcpHandler(() => {
  const mcp = new McpServer({
    name: appName,
    version: '1.0.0',
  });

  registerSourceTools(mcp, source, docsLlms);
  registerSearchTool(mcp, searchServer);

  return mcp;
});

export function GET(request: Request) {
  return handler.fetch(request);
}

export function POST(request: Request) {
  return handler.fetch(request);
}

export function DELETE(request: Request) {
  return handler.fetch(request);
}
