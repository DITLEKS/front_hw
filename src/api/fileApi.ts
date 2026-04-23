import { apiBaseUrl } from './chatApi';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const uploadFile = async (
  dataUrl: string,
  mimeType: string,
  retries = 3
): Promise<string> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(`${apiBaseUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, mimeType }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.id as string;
    }

    const errText = await response.text();

    if (response.status === 429 && attempt < retries) {
      await sleep(1000 * (attempt + 1));
      continue;
    }

    throw new Error(`Ошибка загрузки файла: ${response.status} ${errText}`);
  }

  throw new Error('Не удалось загрузить файл после нескольких попыток');
};