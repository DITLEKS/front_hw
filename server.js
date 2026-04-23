const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GIGACHAT_TOKEN) {
  console.error('❌ GIGACHAT_TOKEN не задан в .env файле');
  process.exit(1);
}

const GIGACHAT_TOKEN = process.env.GIGACHAT_TOKEN;

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  console.log('Refreshing GigaChat token...');
  const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${GIGACHAT_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'RqUID': crypto.randomUUID(),
    },
    body: 'scope=GIGACHAT_API_PERS',
    agent: new https.Agent({ rejectUnauthorized: false }),
  });

  if (!response.ok) {
    throw new Error(`OAuth failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = data.expires_at;
  console.log('✅ Token refreshed, expires at:', new Date(tokenExpiresAt).toISOString());
  return accessToken;
}

app.post('/api/oauth', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ access_token: token, expires_at: tokenExpiresAt });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const token = await getAccessToken();

    console.log('Sending chat request...');
    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(req.body),
      agent: new https.Agent({ rejectUnauthorized: false }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat failed: ${response.status} ${response.statusText}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    res.status(response.status);
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (req.body.stream === true && response.body) {
      res.setHeader('Cache-Control', 'no-cache');
      res.flushHeaders();
      response.body.pipe(res);
      return;
    }

    const data = await response.json();
    console.log('Chat response received');
    res.json(data);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', tokenValid: accessToken && Date.now() < tokenExpiresAt });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
});