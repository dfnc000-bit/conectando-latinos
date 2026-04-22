-- Agregar columna de direccion exacta y coordenadas a la tabla proveedores
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS lat NUMERIC(10,7);
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS lng NUMERIC(10,7);

-- Actualizar datos semilla con coordenadas reales de Melbourne
UPDATE public.proveedores SET 
  direccion = '123 Barkly St, Footscray VIC 3011',
  lat = -37.8001, lng = 144.8996
WHERE email = 'ana@ejemplo.com';

UPDATE public.proveedores SET 
  direccion = '45 Sunshine Ave, Sunshine VIC 3020',
  lat = -37.7889, lng = 144.8304
WHERE email = 'carlos@ejemplo.com';

UPDATE public.proveedores SET 
  direccion = '78 Foster St, Dandenong VIC 3175',
  lat = -37.9879, lng = 145.2160
WHERE email = 'maria@ejemplo.com';

UPDATE public.proveedores SET 
  direccion = '210 Swanston St, Melbourne VIC 3000',
  lat = -37.8136, lng = 144.9631
WHERE email = 'sofia@ejemplo.com';

UPDATE public.proveedores SET 
  direccion = '33 Main Rd E, St Albans VIC 3021',
  lat = -37.7469, lng = 144.8041
WHERE email = 'valentina@ejemplo.com';

UPDATE public.proveedores SET 
  direccion = '5 Heaths Rd, Werribee VIC 3030',
  lat = -37.8998, lng = 144.6618
WHERE email = 'diego@ejemplo.com';
