-- Criar bucket 'screenshots' com acesso público para armazenar screenshots das páginas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública - qualquer pessoa pode ver screenshots
CREATE POLICY "Screenshots are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

-- Política de upload - permite service role inserir
CREATE POLICY "Service role can upload screenshots" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'screenshots');

-- Política de update - permite service role atualizar (upsert)
CREATE POLICY "Service role can update screenshots" ON storage.objects
FOR UPDATE USING (bucket_id = 'screenshots');

-- Política de delete - permite service role deletar
CREATE POLICY "Service role can delete screenshots" ON storage.objects
FOR DELETE USING (bucket_id = 'screenshots');