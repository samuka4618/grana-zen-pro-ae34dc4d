-- Adicionar política RLS de UPDATE para a tabela categories
-- Permite que usuários atualizem suas próprias categorias
CREATE POLICY "Users can update their own categories"
ON public.categories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);