/**
 * Netlify Function: Send Email via Resend
 * 
 * This function sends emails using the Resend API.
 * Configure RESEND_API_KEY in Netlify environment variables.
 * 
 * Usage: POST /.netlify/functions/send-email
 * Body: { to, subject, html, from? }
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'RESEND_API_KEY not configured' }) };
    }

    const { to, subject, html, from } = JSON.parse(event.body || '{}');

    if (!to || !subject || !html) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }) };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || process.env.RESEND_FROM_EMAIL || 'Tomastech <noreply@tomastech.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Resend API error', details: data }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: data.id }) };
  } catch (error: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

export { handler };
