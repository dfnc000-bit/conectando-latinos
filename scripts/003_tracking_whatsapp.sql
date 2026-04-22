-- Tabla para registrar cada click al boton de WhatsApp
CREATE TABLE IF NOT EXISTS public.clicks_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id TEXT NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  suburb_cliente TEXT,
  fuente TEXT DEFAULT 'perfil' -- 'perfil' o 'servicios'
);

ALTER TABLE public.clicks_whatsapp ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (no necesita estar logueado)
CREATE POLICY "clicks_insert_public" ON public.clicks_whatsapp
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden leer todos los clicks
CREATE POLICY "clicks_select_admin" ON public.clicks_whatsapp
  FOR SELECT USING (true);
