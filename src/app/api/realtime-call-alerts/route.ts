import { NextRequest } from "next/server";
import { callAlertEmitter, IncomingCallEventPayload } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat connection established message
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "ok", time: new Date().toISOString() })}\n\n`)
      );

      const onCallAlert = (payload: IncomingCallEventPayload) => {
        try {
          controller.enqueue(
            encoder.encode(`event: call-alert\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch (err) {
          console.error("Error writing to SSE stream:", err);
        }
      };

      // Listen for call alert events from EventEmitter
      callAlertEmitter.on("incoming-call", onCallAlert);

      // Periodic heartbeat ping every 25 seconds to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 25000);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        callAlertEmitter.off("incoming-call", onCallAlert);
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
