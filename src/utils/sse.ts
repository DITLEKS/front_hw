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
        eventType = line.replace('event:', '').trim();
      }
      if (line.startsWith('data:')) {
        data += line.replace('data:', '').trim();
      }
    }

    if (data) {
      events.push({ event: eventType, data });
    }
  }

  return { events, remainder };
};