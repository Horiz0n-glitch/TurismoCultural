import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_EMAIL_TO || 'info@turismocultural.com.ar';
    const fromEmail = process.env.CONTACT_EMAIL_FROM || 'Turismo Cultural <onresend@resend.dev>';

    if (!apiKey) {
      console.error('[Contacto] RESEND_API_KEY no configurada');
      return NextResponse.json(
        { error: 'Servicio de correo no disponible. Intenta más tarde.' },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);

    const safeName = escapeHtml(String(name).slice(0, 200));
    const safeEmail = escapeHtml(String(email).slice(0, 200));
    const safeMessage = escapeHtml(String(message).slice(0, 5000));

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[Turismo Cultural] Contacto de ${safeName}`,
      html: `
        <h2 style="font-family:Arial,sans-serif;color:#333">Nuevo mensaje desde el formulario de contacto</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif">
          <tr>
            <td style="padding:8px;background:#f5f5f5;font-weight:700;width:100px">Nombre</td>
            <td style="padding:8px">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f5f5;font-weight:700">Email</td>
            <td style="padding:8px">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px;background:#f5f5f5;font-weight:700;vertical-align:top">Mensaje</td>
            <td style="padding:8px">${safeMessage.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <hr style="margin-top:24px;border:none;border-top:1px solid #eee">
        <p style="color:#999;font-size:12px;font-family:Arial,sans-serif">Enviado desde TurismoCultural.com.ar</p>
      `,
    });

    if (error) {
      console.error('[Contacto] Error de Resend:', error);
      return NextResponse.json(
        { error: 'Error al enviar el mensaje. Intenta de nuevo más tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contacto] Error al procesar:', error);
    return NextResponse.json(
      { error: 'Error al enviar el mensaje. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
