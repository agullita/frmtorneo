-- Agregar usuario scastro.fundacion@ext.realmadrid.es como administrador
INSERT INTO public.user_roles (user_id, role)
VALUES ('ebb4d56b-d38b-4bd6-87f3-14bf7439ce24', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;