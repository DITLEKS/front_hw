export interface SseEvent {
  event?: string;
  data: string;
}

export const parseSseEvents = (chunk: string, buffer: string) => {
  const raw = buffer + chunk;
  const events: SseEvent[] = [];
  const parts = raw.split(/\r?\n\r?\n/);
  const remainder = parts.pop() || '';

  for (const part of parts) {
    if (!part.trim()) {
      continue;
    }

    const lines = part.split(/\r?\n/);
    let eventType: string | undefined;
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data += (data ? '\n' : '') + line.slice(5).trim();
      }
    }

    if (data) {
      events.push({ event: eventType, data });
    }
  }

  return { events, remainder };
};