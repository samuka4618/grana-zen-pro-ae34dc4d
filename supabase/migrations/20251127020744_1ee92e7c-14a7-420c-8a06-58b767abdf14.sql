-- ============================================
-- MIGRATION: Sistema de Assinaturas
-- ============================================
-- Copie e cole este arquivo COMPLETO no SQL Editor do Supabase
-- Acesse: Supabase Dashboard > SQL Editor > New Query
-- Cole tudo e clique em "Run"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'premium'
  display_name TEXT NOT NULL, -- 'Gratuito', 'Pro', 'Premium'
  description TEXT,
  price_monthly DECIMAL(10, 2) DEFAULT 0,
  price_yearly DECIMAL(10, 2) DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '{}', -- Limites de funcionalidades
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'expired')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Um usuário pode ter apenas uma assinatura ativa
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (todos podem ver os planos)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TABLE (
  plan_id UUID,
  plan_name TEXT,
  display_name TEXT,
  features JSONB,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.display_name,
    sp.features,
    us.status,
    us.current_period_end
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
    AND us.status IN ('active', 'trialing')
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Se não encontrou assinatura ativa, retorna plano gratuito
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      sp.id,
      sp.name,
      sp.display_name,
      sp.features,
      'active'::TEXT,
      NULL::TIMESTAMP WITH TIME ZONE
    FROM public.subscription_plans sp
    WHERE sp.name = 'free'
    LIMIT 1;
  END IF;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans (apenas se não existirem)
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features) 
SELECT 'free', 'Gratuito', 'Plano básico com funcionalidades essenciais', 0, 0, '{
  "max_transactions": 50,
  "max_bank_accounts": 2,
  "max_credit_cards": 1,
  "max_investments": 5,
  "max_recurring_contracts": 3,
  "max_installments": 10,
  "ai_analyses_per_month": 3,
  "exports_per_month": 5,
  "max_shared_users": 0,
  "advanced_analytics": false,
  "priority_support": false
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'free');

INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features) 
SELECT 'pro', 'Pro', 'Plano profissional com recursos avançados', 29.90, 299.00, '{
  "max_transactions": 500,
  "max_bank_accounts": 10,
  "max_credit_cards": 5,
  "max_investments": 50,
  "max_recurring_contracts": 20,
  "max_installments": 100,
  "ai_analyses_per_month": 30,
  "exports_per_month": 50,
  "max_shared_users": 3,
  "advanced_analytics": true,
  "priority_support": true
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'pro');

INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features) 
SELECT 'premium', 'Premium', 'Plano completo com todos os recursos', 59.90, 599.00, '{
  "max_transactions": -1,
  "max_bank_accounts": -1,
  "max_credit_cards": -1,
  "max_investments": -1,
  "max_recurring_contracts": -1,
  "max_installments": -1,
  "ai_analyses_per_month": -1,
  "exports_per_month": -1,
  "max_shared_users": -1,
  "advanced_analytics": true,
  "priority_support": true
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'premium');

-- Verificar se tudo foi criado corretamente
SELECT 
  name,
  display_name,
  price_monthly,
  price_yearly,
  active
FROM public.subscription_plans
ORDER BY 
  CASE name 
    WHEN 'free' THEN 1 
    WHEN 'pro' THEN 2 
    WHEN 'premium' THEN 3 
  END;