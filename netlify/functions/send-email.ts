/**
 * Netlify Function: Contact Form & Email Dispatcher via Resend
 * 
 * Securely handles contact form submissions from tomastech.dev.
 * Sends inquiry notifications to hello@tomastech.dev and logs submissions.
 * 
 * Required Environment Variables in Netlify:
 * - RESEND_API_KEY: Resend API Key (re_...)
 * - CONTACT_RECEIVER_EMAIL (Optional, defaults to hello@tomastech.dev)
 * - RESEND_FROM_EMAIL (Optional, defaults to 'Tomastech Inquiries <hello@tomastech.dev>' or 'onboarding@resend.dev')
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle pre-flight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, message, honeypot, subject: customSubject } = body;

    // 1. Anti-spam Honeypot Check (if filled by bot, reject silently)
    if (honeypot) {
      console.warn('[SPAM DETECTED] Honeypot filled:', honeypot);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message sent successfully' }),
      };
    }

    // 2. Validate Inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please provide a valid name.' }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please provide a valid email address.' }),
      };
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please provide a message of at least 5 characters.' }),
      };
    }

    if (message.length > 2000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message exceeds maximum length of 2000 characters.' }),
      };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('[CONFIG ERROR] RESEND_API_KEY is not configured in environment variables.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service configuration error. Please contact hello@tomastech.dev directly.' }),
      };
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'hello@tomastech.dev';
    // Use verified domain or fallback to Resend onboarding address
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Tomastech Inquiries <onboarding@resend.dev>';
    const subject = customSubject || `New Project Inquiry from ${name.trim()} - Tomastech`;

    // 3. Build HTML Template
    const sanitizedName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sanitizedEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sanitizedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    const submissionDate = new Date().toLocaleString('en-US', { timeZone: 'America/Lima', dateStyle: 'full', timeStyle: 'medium' });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #f3f4f6; border-radius: 16px; overflow: hidden; border: 1px solid #1f293d;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">New Project Inquiry</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Received via tomastech.dev Contact Form</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <div style="background-color: #131b2e; border: 1px solid #232f48; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 90px; font-weight: 600; text-transform: uppercase;">From:</td>
                <td style="padding: 6px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${sanitizedName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase;">Email:</td>
                <td style="padding: 6px 0; color: #818cf8; font-size: 15px;">
                  <a href="mailto:${sanitizedEmail}" style="color: #818cf8; text-decoration: none;">${sanitizedEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase;">Date:</td>
                <td style="padding: 6px 0; color: #d1d5db; font-size: 13px;">${submissionDate} (PET)</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #9ca3af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 0;">Project Details & Message:</h3>
            <div style="background-color: #111827; border: 1px solid #1f2937; border-left: 4px solid #6366f1; border-radius: 8px; padding: 18px; color: #e5e7eb; font-size: 14px; line-height: 1.6;">
              ${sanitizedMessage}
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <a href="mailto:${sanitizedEmail}?subject=Re:%20Project%20Inquiry%20-%20Tomastech" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px;">
              Reply to ${sanitizedName}
            </a>
          </div>
        </div>

        <div style="background-color: #060911; padding: 16px 24px; border-top: 1px solid #1f293d; text-align: center; font-size: 12px; color: #6b7280;">
          Tomastech 2026 — Software Engineering & Business Systems
        </div>
      </div>
    `;

    // 4. Send Email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [receiverEmail],
        reply_to: email.trim(),
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[RESEND API ERROR]', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Failed to send email via Resend', details: data }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Your inquiry has been received. We will respond within 24 hours.',
        id: data.id,
      }),
    };
  } catch (error: any) {
    console.error('[HANDLER ERROR]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

export { handler };
