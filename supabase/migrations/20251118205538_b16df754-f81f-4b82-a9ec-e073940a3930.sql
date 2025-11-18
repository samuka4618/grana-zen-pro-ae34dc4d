-- Criar bucket para anexos financeiros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'financial-attachments',
  'financial-attachments',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Adicionar coluna de anexo na tabela transactions
ALTER TABLE public.transactions
ADD COLUMN attachment_url TEXT;

-- Políticas RLS para o bucket de anexos
CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'financial-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'financial-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own attachments"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'financial-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'financial-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);