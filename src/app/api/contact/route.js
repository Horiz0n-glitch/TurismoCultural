import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate
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

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.CONTACT_EMAIL || 'info@turismocultural.com.ar';

    if (smtpHost && smtpUser && smtpPass) {
      // Send via Nodemailer
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"${name}" <${smtpUser}>`,
        replyTo: email,
        to: toEmail,
        subject: `[Turismo Cultural] Contacto de ${name}`,
        text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
        html: `
          <h2>Nuevo mensaje desde el formulario de contacto</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:700;width:100px">Nombre</td>
                <td style="padding:8px">${name.replace(/</g, '&lt;')}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:700">Email</td>
                <td style="padding:8px">${email.replace(/</g, '&lt;')}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:700">Mensaje</td>
                <td style="padding:8px">${message.replace(/\n/g, '<br>').replace(/</g, '&lt;')}</td></tr>
          </table>
          <hr style="margin-top:24px;border:none;border-top:1px solid #eee">
          <p style="color:#999;font-size:12px">Enviado desde TurismoCultural.com.ar</p>
        `,
      });
    } else {
      // Fallback: log to console in dev, or use a mail service
      console.log('[Contacto] Mensaje recibido (SMTP no configurado):', { name, email, message });
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
