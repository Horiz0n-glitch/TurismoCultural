'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  UsersIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function Contacto() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <div className="category-header">
        <h1>Contacto</h1>
        <p>Comunicate con nosotros</p>
      </div>

      <div className="container-site" style={{ padding: '48px 20px', maxWidth: 700, margin: '0 auto' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
          <div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 12 }}>Información de Contacto</h3>
            <div style={{ fontSize: 15, color: '#555', lineHeight: 2 }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <EnvelopeIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>info@turismocultural.com.ar</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GlobeAltIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>www.turismocultural.com.ar</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPinIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>Argentina</span>
              </p>
            </div>
          </div>
          <div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 12 }}>Redes Sociales</h3>
            <div style={{ fontSize: 15, color: '#555', lineHeight: 2 }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UsersIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>Facebook: /TurismoCultural</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CameraIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>Instagram: @turismocultural</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChatBubbleLeftRightIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <span>X (Twitter): @TurismoCultura</span>
              </p>
            </div>
          </div>
        </div>

        {sent ? (
            <div style={{ textAlign: 'center', padding: 40,
            background: '#f6f6f6', borderRadius: 10,
            border: '1px solid #e0dede'
          }}>
            <CheckCircleIcon className="h-12 w-12 mx-auto" style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ marginTop: 12 }}>Mensaje enviado</h3>
            <p style={{ color: '#666', marginTop: 8 }}>
              Gracias por comunicarte. Te responderemos a la brevedad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: '#f9f9f9', padding: 28, borderRadius: 10,
            border: '1px solid #e0dede'
          }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 20 }}>Enviar Mensaje</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Nombre</label>
              <input type="text" required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Email</label>
              <input type="email" required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Mensaje</label>
              <textarea rows={5} required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary">
              Enviar mensaje
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/" className="btn-primary small">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}
