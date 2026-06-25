import { createFileRoute } from "@tanstack/react-router";
import { createWidgetScript } from "@/lib/widget-script";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/widget.js")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async () =>
        new Response(createWidgetScript(), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        }),
    },
  },
});