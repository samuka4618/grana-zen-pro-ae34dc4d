-- Create enum for share permissions
CREATE TYPE public.share_permission AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create table for account sharing
CREATE TABLE public.shared_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission public.share_permission NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shared_by)
);

-- Enable RLS
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has access to another user's data
CREATE OR REPLACE FUNCTION public.has_shared_access(_viewer_id UUID, _owner_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shared_access
    WHERE user_id = _viewer_id
      AND shared_by = _owner_id
  ) OR _viewer_id = _owner_id;
$$;

-- Create function to check permission level
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _owner_id UUID, _required_permission public.share_permission)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shared_access
    WHERE user_id = _user_id
      AND shared_by = _owner_id
      AND (
        (_required_permission = 'viewer' AND permission IN ('viewer', 'editor', 'admin', 'owner')) OR
        (_required_permission = 'editor' AND permission IN ('editor', 'admin', 'owner')) OR
        (_required_permission = 'admin' AND permission IN ('admin', 'owner')) OR
        (_required_permission = 'owner' AND permission = 'owner')
      )
  ) OR _user_id = _owner_id;
$$;

-- RLS Policies for shared_access
CREATE POLICY "Users can view their own shares and shares they created"
ON public.shared_access FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = shared_by);

CREATE POLICY "Users can create shares for their own data"
ON public.shared_access FOR INSERT
WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete shares they created"
ON public.shared_access FOR DELETE
USING (auth.uid() = shared_by);

CREATE POLICY "Owners can update shares they created"
ON public.shared_access FOR UPDATE
USING (auth.uid() = shared_by);

-- Update RLS policies for transactions to include shared access
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own and shared transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
CREATE POLICY "Users can create transactions if they have editor access"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update transactions if they have editor access"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can delete transactions if they have admin access"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for bank_accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.bank_accounts;
CREATE POLICY "Users can view their own and shared accounts"
ON public.bank_accounts FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own accounts" ON public.bank_accounts;
CREATE POLICY "Users can create accounts if they have editor access"
ON public.bank_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own accounts" ON public.bank_accounts;
CREATE POLICY "Users can update accounts if they have editor access"
ON public.bank_accounts FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.bank_accounts;
CREATE POLICY "Users can delete accounts if they have admin access"
ON public.bank_accounts FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for credit_cards
DROP POLICY IF EXISTS "Users can view their own cards" ON public.credit_cards;
CREATE POLICY "Users can view their own and shared cards"
ON public.credit_cards FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own cards" ON public.credit_cards;
CREATE POLICY "Users can create cards if they have editor access"
ON public.credit_cards FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own cards" ON public.credit_cards;
CREATE POLICY "Users can update cards if they have editor access"
ON public.credit_cards FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own cards" ON public.credit_cards;
CREATE POLICY "Users can delete cards if they have admin access"
ON public.credit_cards FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for categories
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
CREATE POLICY "Users can view their own and shared categories"
ON public.categories FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
CREATE POLICY "Users can create categories if they have editor access"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "Users can update categories if they have editor access"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'))
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "Users can delete categories if they have admin access"
ON public.categories FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for recurring_contracts
DROP POLICY IF EXISTS "Users can view their own recurring contracts" ON public.recurring_contracts;
CREATE POLICY "Users can view their own and shared contracts"
ON public.recurring_contracts FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own recurring contracts" ON public.recurring_contracts;
CREATE POLICY "Users can create contracts if they have editor access"
ON public.recurring_contracts FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own recurring contracts" ON public.recurring_contracts;
CREATE POLICY "Users can update contracts if they have editor access"
ON public.recurring_contracts FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own recurring contracts" ON public.recurring_contracts;
CREATE POLICY "Users can delete contracts if they have admin access"
ON public.recurring_contracts FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for installments
DROP POLICY IF EXISTS "Users can view their own installments" ON public.installments;
CREATE POLICY "Users can view their own and shared installments"
ON public.installments FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own installments" ON public.installments;
CREATE POLICY "Users can create installments if they have editor access"
ON public.installments FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own installments" ON public.installments;
CREATE POLICY "Users can update installments if they have editor access"
ON public.installments FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own installments" ON public.installments;
CREATE POLICY "Users can delete installments if they have admin access"
ON public.installments FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for credit_card_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can view their own and shared purchases"
ON public.credit_card_purchases FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can create purchases if they have editor access"
ON public.credit_card_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can update purchases if they have editor access"
ON public.credit_card_purchases FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.credit_card_purchases;
CREATE POLICY "Users can delete purchases if they have admin access"
ON public.credit_card_purchases FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for financial_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.financial_goals;
CREATE POLICY "Users can view their own and shared goals"
ON public.financial_goals FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own goals" ON public.financial_goals;
CREATE POLICY "Users can create goals if they have editor access"
ON public.financial_goals FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own goals" ON public.financial_goals;
CREATE POLICY "Users can update goals if they have editor access"
ON public.financial_goals FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.financial_goals;
CREATE POLICY "Users can delete goals if they have admin access"
ON public.financial_goals FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Update RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own and shared notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;
CREATE POLICY "Users can create notifications if they have editor access"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update notifications if they have editor access"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete notifications if they have admin access"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));