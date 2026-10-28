import { slugify } from '@/lib/utils';

export interface ArgentineProvince {
  name: string;
  slug: string;
  displayName: string;
}

// Argentina's 23 provinces and the Autonomous City of Buenos Aires.
export const argentineProvinces: ArgentineProvince[] = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
  'CABA',
].map(name => ({
  name,
  slug: slugify(name),
  displayName: name === 'CABA'
    ? 'Ciudad Autónoma de Buenos Aires'
    : name === 'Tierra del Fuego'
      ? 'Tierra del Fuego, Antártida e Islas del Atlántico Sur'
      : name,
}));
