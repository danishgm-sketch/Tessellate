import { DurableObject } from 'cloudflare:workers';
import type { Env } from '../types.js';
import { claimNextFairly, type TicketStore } from '../inference/store.js';

/**
 * Real-time dispatch hub for host daemons (D-035).
 *
 * Daemons hold one outbound WebSocket to this Durable Object. The WebSocket Hibernation API means an
 * idle connection costs nothing; the hub wakes only when a message arrives or new work is announced.
 * Claims, results and leases all go through the same TicketStore as the HTTP fallback, so fairness and
 * crash recovery are identical on both transports.
 *
 * Protocol (JSON text frames)
 *   daemon → hub: {type:'ready'} | {type:'heartbeat'} | {type:'complete', ticketId, result?, error?}
 *   hub → daemon: {type:'task', task} | {type:'idle'} | {type:'work-available'} | {type:'ack', ticketId, ok, message?}
 */
export class QueueHub extends DurableObject<Env> {
  /** Resolves the ticket store. Injected by the Worker module (avoids a circular import). */
  static storeFactory: ((env: Env) => TicketStore) | null = null;
  /** Validates and records a daemon result; returns an error message or null. Injected by the Worker. */
  static completeHandler: ((env: Env, deviceId: string, ticketId: string, result: unknown, error?: string) => Promise<string | null>) | null = null;

  private store(): TicketStore {
    if (!QueueHub.storeFactory) throw new Error('QueueHub store factory not configured');
    return QueueHub.storeFactory(this.env);
  }

  override async fetch(request: Request): Promise<Response> {
    const deviceId = request.headers.get('X-Tessellate-Device');
    if (request.headers.get('Upgrade') !== 'websocket' || !deviceId) {
      return new Response('Expected an authenticated WebSocket upgrade', { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.ctx.acceptWebSocket(server, [`device:${deviceId}`]);
    server.serializeAttachment({ deviceId, waiting: false });
    await this.store().touchDevice(deviceId, new Date().toISOString());
    return new Response(null, { status: 101, webSocket: client });
  }

  /** Called by the Worker after a ticket is enqueued. */
  async announceWork(): Promise<number> {
    let notified = 0;
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment() as { deviceId: string; waiting: boolean } | null;
      if (att?.waiting) {
        ws.send(JSON.stringify({ type: 'work-available' }));
        notified++;
      }
    }
    return notified;
  }

  async connectedDevices(): Promise<number> {
    return this.ctx.getWebSockets().length;
  }

  override async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const att = (ws.deserializeAttachment() as { deviceId: string; waiting: boolean } | null) ?? null;
    if (!att) {
      ws.close(1008, 'unauthenticated');
      return;
    }
    let msg: { type?: string; ticketId?: string; result?: unknown; error?: string };
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw));
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Malformed message' }));
      return;
    }

    const store = this.store();
    await store.touchDevice(att.deviceId, new Date().toISOString());

    if (msg.type === 'heartbeat') return;

    if (msg.type === 'complete' && typeof msg.ticketId === 'string') {
      const problem = QueueHub.completeHandler
        ? await QueueHub.completeHandler(this.env, att.deviceId, msg.ticketId, msg.result, msg.error)
        : 'Completion handler not configured';
      ws.send(JSON.stringify({ type: 'ack', ticketId: msg.ticketId, ok: problem === null, message: problem ?? undefined }));
      return;
    }

    if (msg.type === 'ready') {
      const ticket = await claimNextFairly(store, att.deviceId);
      if (ticket) {
        ws.serializeAttachment({ ...att, waiting: false });
        let context: unknown = {};
        try {
          context = JSON.parse(ticket.payload);
        } catch {
          context = {};
        }
        ws.send(JSON.stringify({ type: 'task', task: { id: ticket.id, kind: ticket.kind, tokenNumber: ticket.tokenNumber, prompt: ticket.prompt, context } }));
      } else {
        ws.serializeAttachment({ ...att, waiting: true });
        ws.send(JSON.stringify({ type: 'idle' }));
      }
      return;
    }

    ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${String(msg.type)}` }));
  }

  override async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    // Any ticket the daemon was working on is recovered by its lease (no ticket is ever lost).
    try {
      ws.close(code, 'closing');
    } catch {
      // already closed
    }
  }
}
