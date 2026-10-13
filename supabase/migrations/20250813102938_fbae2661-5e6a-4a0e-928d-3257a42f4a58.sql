-- Limpiar datos corruptos de la base de conocimiento
DELETE FROM knowledge_base WHERE content LIKE '%hr ;{5N0%' OR content LIKE '%x k 2 g_z%';

-- Verificar que la tabla esté limpia
SELECT COUNT(*) as registros_restantes FROM knowledge_base;