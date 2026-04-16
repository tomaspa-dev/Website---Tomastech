import React, { useState, useRef } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FieldState {
  focused: boolean;
  hasValue: boolean;
}

function FloatingInput({
  id, label, type = 'text', required, rows,
  field, onFocus, onBlur, onChange,
}: {
  id: string; label: string; type?: string; required?: boolean; rows?: number;
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
          id={id} required={required} rows={rows}
          className={`${inputClass} resize-none`}
          onFocus={onFocus} onBlur={onBlur} onChange={onChange}
        />
      ) : (
        <input
          id={id} type={type} required={required}
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
  const [charCount, setCharCount] = useState(0);
  const [fields, setFields] = useState({
    name:    { focused: false, hasValue: false },
    email:   { focused: false, hasValue: false },
    message: { focused: false, hasValue: false },
  });

  type FieldKey = keyof typeof fields;

  const setFocused = (key: FieldKey, val: boolean) =>
    setFields(f => ({ ...f, [key]: { ...f[key], focused: val } }));

  const setHasValue = (key: FieldKey, val: boolean) =>
    setFields(f => ({ ...f, [key]: { ...f[key], hasValue: val } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFormStatus('success');
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast("Message sent! We'll reply within 24 hours.", 'success', 5000);
      }
      setTimeout(() => setFormStatus('idle'), 3500);
    }, 1500);
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
          <FloatingInput
            id="name" label="Your Name" required
            field={fields.name}
            onFocus={() => setFocused('name', true)}
            onBlur={(e) => { setFocused('name', false); setHasValue('name', e.target.value.length > 0); }}
            onChange={(e) => setHasValue('name', (e.target as HTMLInputElement).value.length > 0)}
          />

          <FloatingInput
            id="email" label="Email Address" type="email" required
            field={fields.email}
            onFocus={() => setFocused('email', true)}
            onBlur={(e) => { setFocused('email', false); setHasValue('email', e.target.value.length > 0); }}
            onChange={(e) => setHasValue('email', (e.target as HTMLInputElement).value.length > 0)}
          />

          <div className="relative">
            <FloatingInput
              id="message" label="Tell us about your project" required rows={4}
              field={fields.message}
              onFocus={() => setFocused('message', true)}
              onBlur={(e) => { setFocused('message', false); setHasValue('message', e.target.value.length > 0); }}
              onChange={(e) => {
                const len = (e.target as HTMLTextAreaElement).value.length;
                setCharCount(len);
                setHasValue('message', len > 0);
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
        </form>
      </div>
    </>
  );
}
