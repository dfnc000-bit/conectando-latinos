-- Proveedores de ejemplo para el directorio
INSERT INTO public.proveedores (id, nombre, email, telefono, instagram, cat, suburb, descripcion, horario, estado, disponible, destacado, rating, total_resenas, galeria)
VALUES
(
  'p1', 'Peluquería La Costeña', 'lacostena@ejemplo.com', '61400111222', '@pelucostena.melb',
  'Peluquería', 'Footscray',
  'Cortes modernos y clásicos para hombres, mujeres y niños. Especialistas en cabello latino, coloración, keratina y tratamientos capilares.',
  'Lun–Sáb 8am–6pm', 'aprobado', true, true, 4.9, 128, '{}'
),
(
  'p2', 'Barbería El Barrio', 'elbarrio@ejemplo.com', '61400333444', '@barberiaelbarrio',
  'Barbería', 'Dandenong',
  'Cortes modernos y clásicos, perfilado de barba, afeitado con navaja. Ambiente latino con música buena.',
  'Lun–Sáb 9am–7pm', 'aprobado', true, true, 4.8, 96, '{}'
),
(
  'p3', 'Studio Valentina Nails', 'valentina@ejemplo.com', '61400555666', '@studio.valentina.nails',
  'Uñas', 'Sunshine',
  'Especialista en nail art, acrílicas, gel y diseños personalizados. Más de 5 años de experiencia.',
  'Mar–Dom 9am–7pm', 'aprobado', true, false, 5.0, 94, '{}'
),
(
  'p4', 'Masajes Bienestar Latino', 'bienestar@ejemplo.com', '61400777888', '@bienestarlatino.melb',
  'Masajes', 'Werribee',
  'Masajes relajantes, deportivos y terapéuticos. Técnicas latinoamericanas y orientales. Atiendo a domicilio y en estudio.',
  'Mar–Dom 10am–9pm', 'aprobado', false, false, 4.9, 53, '{}'
),
(
  'p5', 'Lashes by Camila', 'camila@ejemplo.com', '61400999111', '@lashesbycamila',
  'Pestañas', 'St Albans',
  'Extensiones de pestañas clásicas, volumen ruso y mega volumen. Resultados naturales o dramáticos según tu estilo.',
  'Lun–Vie 10am–8pm', 'aprobado', true, true, 4.8, 76, '{}'
),
(
  'p6', 'Glam by Paola', 'paola@ejemplo.com', '61401000111', '@glambypaola',
  'Maquillaje', 'Point Cook',
  'Maquillaje profesional para eventos, quinceañeras, bodas y sesiones de fotos. Atiendo en tu domicilio o en mi estudio.',
  'Lun–Dom 8am–9pm', 'aprobado', true, true, 5.0, 112, '{}'
)
ON CONFLICT (id) DO NOTHING;

-- Servicios de cada proveedor
INSERT INTO public.servicios (proveedor_id, nombre, precio) VALUES
('p1', 'Corte de cabello', '$35–$50 AUD'),
('p1', 'Coloración completa', '$80–$120 AUD'),
('p1', 'Keratina brasileña', '$150 AUD'),
('p1', 'Tratamiento hidratante', '$45 AUD'),
('p2', 'Corte de cabello', '$30 AUD'),
('p2', 'Corte + barba', '$50 AUD'),
('p2', 'Afeitado con navaja', '$35 AUD'),
('p2', 'Diseño de barba', '$25 AUD'),
('p3', 'Uñas en gel completas', '$60 AUD'),
('p3', 'Acrílicas', '$75 AUD'),
('p3', 'Nail art (por uña)', '$5–$15 AUD'),
('p3', 'Retoque (cada 3 semanas)', '$40 AUD'),
('p4', 'Masaje relajante 60 min', '$80 AUD'),
('p4', 'Masaje deportivo 60 min', '$90 AUD'),
('p4', 'Masaje a domicilio', '$100 AUD'),
('p4', 'Masaje de pareja', '$170 AUD'),
('p5', 'Extensiones clásicas', '$90 AUD'),
('p5', 'Volumen ruso', '$120 AUD'),
('p5', 'Mega volumen', '$150 AUD'),
('p5', 'Retoque (cada 3 sem)', '$60 AUD'),
('p6', 'Maquillaje social', '$70 AUD'),
('p6', 'Maquillaje de novia', '$150 AUD'),
('p6', 'Quinceañera', '$120 AUD'),
('p6', 'Sesión de fotos', '$90 AUD')
ON CONFLICT DO NOTHING;

-- Reseñas de ejemplo
INSERT INTO public.resenas (proveedor_id, nombre_usuario, rating, comentario) VALUES
('p1', 'Carolina M.', 5, 'Por fin alguien que sabe trabajar el cabello latino. Increíble resultado.'),
('p1', 'Luis H.', 5, 'El mejor corte que me hicieron desde que llegué a Melbourne. Recomendado.'),
('p2', 'Felipe M.', 5, 'El único lugar donde me corto el cabello. Ambiente increíble y corte perfecto.'),
('p2', 'Cristian L.', 5, 'Como en casa. Los mejores de Dandenong sin duda alguna.'),
('p3', 'María C.', 5, 'Las mejores uñas que me han hecho en Melbourne. Super prolija y rápida.'),
('p3', 'Daniela R.', 5, 'Vale cada centavo. Me hice el nail art más hermoso para mi cumpleaños.'),
('p4', 'Roberto A.', 5, 'El mejor masaje que recibí en mi vida. Muy profesional y relajante.'),
('p4', 'Paola S.', 5, 'Vino a mi casa y fue increíble. Total relajación.'),
('p5', 'Sofía T.', 5, 'Me duran perfecto. Camila es muy prolija y detallista.'),
('p5', 'Andrea V.', 4, 'Hermosas, me las recomendaron y no me arrepiento para nada.'),
('p6', 'Jimena C.', 5, 'Me hizo el maquillaje de mi boda y quedé increíble. Total artista.'),
('p6', 'Valeria N.', 5, 'El maquillaje duró todo el evento sin ningún retoque.')
ON CONFLICT DO NOTHING;
