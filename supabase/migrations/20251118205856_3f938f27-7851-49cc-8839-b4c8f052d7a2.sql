-- Criar tabela de cartões de crédito
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  last_four_digits TEXT NOT NULL,
  credit_limit NUMERIC NOT NULL,
  closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cartões
CREATE POLICY "Users can view their own cards"
ON public.credit_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
ON public.credit_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
ON public.credit_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
ON public.credit_cards
FOR DELETE
USING (auth.uid() = user_id);

-- Criar tabela de compras no cartão
CREATE TABLE public.credit_card_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installments INTEGER NOT NULL CHECK (installments >= 1),
  installment_amount NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.credit_card_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para compras
CREATE POLICY "Users can view their own purchases"
ON public.credit_card_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON public.credit_card_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
ON public.credit_card_purchases
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
ON public.credit_card_purchases
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at dos cartões
CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();