#!/usr/bin/env node
/**
 * Minimal Weather API Test Harness
 * - Validates endpoints with sample payloads
 * - Supports optional API_KEY via env
 * - No external dependencies
 */

const http = require('http');
const https = require('https');

const HOST = process.env.WEATHER_API_HOST || 'localhost';
const PORT = parseInt(process.env.WEATHER_API_PORT || '3000', 10);
const BASE = `http://${HOST}:${PORT}`;
const API_KEY = process.env.WEATHER_API_KEY || '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    if (API_KEY) options.headers['Authorization'] = `Bearer ${API_KEY}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const payload = data.trim() ? JSON.parse(data) : null;
        resolve({ status: res.statusCode, payload });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const tests = [
    { name: 'Health', method: 'GET', path: '/health' },
    { name: 'Current weather (mock)', method: 'GET', path: '/weather/current?city=London' },
    { name: 'Forecast (mock)', method: 'GET', path: '/weather/forecast?city=London&days=3' },
  ];

  console.log('Weather API Test Harness');
  console.log('Target:', BASE);
  console.log('API Key:', API_KEY ? 'set' : 'none (mock mode)');
  console.log('---');

  for (const t of tests) {
    try {
      const { status, payload } = await request(t.method, t.path);
      console.log(`${t.name}: ${status}`);
      console.log(JSON.stringify(payload, null, 2));
      console.log('---');
    } catch (e) {
      console.error(`${t.name}: ERROR - ${e.message}`);
    }
  }
}

run();
