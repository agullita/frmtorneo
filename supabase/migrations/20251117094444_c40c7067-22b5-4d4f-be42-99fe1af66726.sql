-- Agregar usuario rdiez.fundacion@ext.realmadrid.es como administrador
INSERT INTO public.user_roles (user_id, role)
VALUES ('09e0d54d-da97-4cce-b6fc-3f6eca2e6bf4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;