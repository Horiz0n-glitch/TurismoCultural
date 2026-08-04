import ContactoClient from './ContactoClient';

export const metadata = {
  title: 'Contacto',
  description: 'Comunicate con Turismo Cultural. Envíanos tu mensaje y te responderemos a la brevedad.',
  openGraph: {
    title: 'Contacto — Turismo Cultural',
    description: 'Comunicate con Turismo Cultural. Envíanos tu mensaje y te responderemos a la brevedad.',
    url: 'https://turismocultural.com.ar/contacto',
  },
  alternates: {
    canonical: 'https://turismocultural.com.ar/contacto',
  },
};

export default function Contacto() {
  return <ContactoClient />;
}
