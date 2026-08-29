import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FieldState {
  focused: boolean;
  hasValue: boolean;
}

function FloatingInput({
  id, label, type = 'text', required, rows, value,
  field, onFocus, onBlur, onChange,
}: {
  id: string; label: string; type?: string; required?: boolean; rows?: number; value?: string;
  field: FieldState;
  onFocus: () => void; onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  const active = field.focused || field.hasValue;
  const labelClass = [
    'absolute left-4 pointer-events-none transition-all duration-200 origin-left',
    active
      ? 'top-1.5 text-[10px] font-semibold tracking-wider uppercase cf-label-active'
      : 'top-3.5 text-sm cf-label-idle',
  ].join(' ');

  const inputClass = 'cf-input w-full px-4 pt-6 pb-2.5 rounded-xl outline-none text-sm transition-all duration-300 cf-input-text';

  return (
    <div className="relative cf-field-wrap">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {rows ? (
        <textarea
          id={id} required={required} rows={rows} value={value}
          className={`${inputClass} resize-none`}
          onFocus={onFocus} onBlur={onBlur} onChange={onChange}
        />
      ) : (
        <input
          id={id} type={type} required={required} value={value}
          className={inputClass}
          onFocus={onFocus} onBlur={onBlur} onChange={onChange}
        />
      )}
      {/* Focus glow ring */}
      <div className={`cf-focus-ring absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${field.focused ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '',
  });

  const [fields, setFields] = useState({
    name:    { focused: false, hasValue: false },
    email:   { focused: false, hasValue: false },
    message: { focused: false, hasValue: false },
  });

  type FieldKey = keyof typeof fields;

  const setFocused = (key: FieldKey, val: boolean) =>
    setFields(f => ({ ...f, [key]: { ...f[key], focused: val } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Please fill in all required fields.', 'error');
      }
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          honeypot: formData.honeypot,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message. Please try again.');
      }

      setFormStatus('success');
      setFormData({ name: '', email: '', message: '', honeypot: '' });
      setCharCount(0);
      setFields({
        name: { focused: false, hasValue: false },
        email: { focused: false, hasValue: false },
        message: { focused: false, hasValue: false },
      });

      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast("Message sent! We'll reply within 24 hours.", 'success', 6000);
      }

      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (err: any) {
      console.error('Contact Form Error:', err);
      setFormStatus('error');
      const msg = err.message || 'Could not send message. Please try emailing hello@tomastech.dev directly.';
      setErrorMessage(msg);
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast(msg, 'error', 6000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Card */
        .cf-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .cf-title { color: #ffffff; }
        .cf-subtitle { color: #9ca3af; }
        html.light .cf-card { background: rgba(255,255,255,0.85); border: 1px solid rgba(99,102,241,0.12); box-shadow: 0 8px 48px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.06); }
        html.light .cf-title { color: #0f172a; }
        html.light .cf-subtitle { color: #64748b; }

        /* Fields */
        .cf-field-wrap { }
        .cf-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; }
        .cf-input:focus { border-color: rgba(99,102,241,0.6); background: rgba(255,255,255,0.07); }
        .cf-input-text { color: #fff; }
        .cf-label-idle { color: #6b7280; }
        .cf-label-active { color: #818cf8; }
        html.light .cf-input { background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.18); color: #0f172a; }
        html.light .cf-input:focus { border-color: rgba(99,102,241,0.55); background: rgba(99,102,241,0.06); }
        html.light .cf-input-text { color: #0f172a; }
        html.light .cf-label-idle { color: #94a3b8; }
        html.light .cf-label-active { color: #6366f1; }

        /* Focus glow */
        .cf-focus-ring { box-shadow: 0 0 0 3px rgba(99,102,241,0.18), 0 0 16px rgba(99,102,241,0.12); }
        html.light .cf-focus-ring { box-shadow: 0 0 0 3px rgba(99,102,241,0.14), 0 0 12px rgba(99,102,241,0.08); }

        /* Character counter */
        .cf-char-count { color: #6b7280; }
        html.light .cf-char-count { color: #94a3b8; }
        .cf-char-count.near { color: #f59e0b; }
        html.light .cf-char-count.near { color: #d97706; }

        /* Card gradient top bar */
        .cf-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #a78bfa, #ec4899, #6366f1);
          background-size: 200% 100%;
          border-radius: 1rem 1rem 0 0;
          animation: cfBar 4s linear infinite;
        }
        @keyframes cfBar {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div id="contact-form" className="cf-card relative w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl overflow-hidden">
        {/* Icon + Heading */}
        <div className="mb-6">
          <h3 className="cf-title text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Let's Build Something Great
          </h3>
          <p className="cf-subtitle mt-1.5 text-sm">
            Fill out the form and we'll get back to you within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field (hidden for users, bots fill it) */}
          <input
            type="text"
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
            value={formData.honeypot}
            onChange={(e) => setFormData(f => ({ ...f, honeypot: e.target.value }))}
            style={{ position: 'absolute', opacity: 0, top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
          />

          <FloatingInput
            id="name" label="Your Name" required
            value={formData.name}
            field={fields.name}
            onFocus={() => setFocused('name', true)}
            onBlur={(e) => {
              setFocused('name', false);
              setFields(f => ({ ...f, name: { ...f.name, hasValue: e.target.value.length > 0 } }));
            }}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(f => ({ ...f, name: val }));
              setFields(f => ({ ...f, name: { ...f.name, hasValue: val.length > 0 } }));
            }}
          />

          <FloatingInput
            id="email" label="Email Address" type="email" required
            value={formData.email}
            field={fields.email}
            onFocus={() => setFocused('email', true)}
            onBlur={(e) => {
              setFocused('email', false);
              setFields(f => ({ ...f, email: { ...f.email, hasValue: e.target.value.length > 0 } }));
            }}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(f => ({ ...f, email: val }));
              setFields(f => ({ ...f, email: { ...f.email, hasValue: val.length > 0 } }));
            }}
          />

          <div className="relative">
            <FloatingInput
              id="message" label="Tell us about your project" required rows={4}
              value={formData.message}
              field={fields.message}
              onFocus={() => setFocused('message', true)}
              onBlur={(e) => {
                setFocused('message', false);
                setFields(f => ({ ...f, message: { ...f.message, hasValue: e.target.value.length > 0 } }));
              }}
              onChange={(e) => {
                const val = e.target.value;
                setCharCount(val.length);
                setFormData(f => ({ ...f, message: val }));
                setFields(f => ({ ...f, message: { ...f.message, hasValue: val.length > 0 } }));
              }}
            />
            <span className={`cf-char-count absolute bottom-2.5 right-3 text-[10px] tabular-nums pointer-events-none ${charCount > 450 ? 'near' : ''}`}>
              {charCount}/500
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || formStatus === 'success'}
            className={[
              'w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 text-white relative overflow-hidden',
              formStatus === 'success'
                ? 'bg-emerald-500 shadow-[0_0_24px_rgba(52,211,153,0.35)]'
                : isLoading
                  ? 'bg-indigo-500 opacity-80 cursor-wait'
                  : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] hover:bg-[position:100%_0] shadow-[0_0_24px_rgba(129,140,248,0.3)] hover:shadow-[0_0_36px_rgba(129,140,248,0.5)] hover:scale-[1.02]',
            ].join(' ')}
            style={{ fontFamily: 'Space Grotesk, sans-serif', transition: 'background-position 0.5s ease, box-shadow 0.3s ease, transform 0.25s ease' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : formStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Message Sent!</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Fallback info on error */}
          {formStatus === 'error' && errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
