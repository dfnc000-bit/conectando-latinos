-- Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'proveedor', 'admin')),
  suburb TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles_select_todos" ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "perfiles_insert_propio" ON public.perfiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "perfiles_update_propio" ON public.perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "perfiles_delete_propio" ON public.perfiles FOR DELETE USING (auth.uid() = id);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.proveedores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  instagram TEXT,
  cat TEXT NOT NULL,
  suburb TEXT NOT NULL,
  descripcion TEXT,
  horario TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'suspendido')),
  disponible BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,1) DEFAULT 5.0,
  total_resenas INTEGER DEFAULT 0,
  avatar_url TEXT,
  cover_url TEXT,
  galeria TEXT[] DEFAULT '{}',
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proveedores_select_todos" ON public.proveedores FOR SELECT USING (true);
CREATE POLICY "proveedores_insert_auth" ON public.proveedores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "proveedores_update_propio" ON public.proveedores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "proveedores_delete_propio" ON public.proveedores FOR DELETE USING (auth.uid() = user_id);

-- Tabla de servicios por proveedor
CREATE TABLE IF NOT EXISTS public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id TEXT NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio TEXT NOT NULL
);

ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_select_todos" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "servicios_insert_proveedor" ON public.servicios FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.proveedores WHERE id = proveedor_id AND user_id = auth.uid())
);
CREATE POLICY "servicios_update_proveedor" ON public.servicios FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.proveedores WHERE id = proveedor_id AND user_id = auth.uid())
);
CREATE POLICY "servicios_delete_proveedor" ON public.servicios FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.proveedores WHERE id = proveedor_id AND user_id = auth.uid())
);

-- Tabla de resenas
CREATE TABLE IF NOT EXISTS public.resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id TEXT NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre_usuario TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resenas_select_todos" ON public.resenas FOR SELECT USING (true);
CREATE POLICY "resenas_insert_auth" ON public.resenas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resenas_update_propio" ON public.resenas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resenas_delete_propio" ON public.resenas FOR DELETE USING (auth.uid() = user_id);

-- Trigger para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, tipo, suburb, fecha_registro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente'),
    COALESCE(NEW.raw_user_meta_data->>'suburb', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
