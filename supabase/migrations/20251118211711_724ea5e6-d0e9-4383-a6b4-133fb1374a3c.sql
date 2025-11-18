-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT,
  account_type TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own accounts"
ON public.bank_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
ON public.bank_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
ON public.bank_accounts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
ON public.bank_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Add bank_account_id to transactions
ALTER TABLE public.transactions
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update account balances
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.bank_account_id IS NOT NULL THEN
      UPDATE bank_accounts
      SET current_balance = current_balance + 
        CASE 
          WHEN NEW.type = 'income' THEN NEW.amount
          ELSE -NEW.amount
        END
      WHERE id = NEW.bank_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old transaction
    IF OLD.bank_account_id IS NOT NULL THEN
      UPDATE bank_accounts
      SET current_balance = current_balance - 
        CASE 
          WHEN OLD.type = 'income' THEN OLD.amount
          ELSE -OLD.amount
        END
      WHERE id = OLD.bank_account_id;
    END IF;
    -- Apply new transaction
    IF NEW.bank_account_id IS NOT NULL THEN
      UPDATE bank_accounts
      SET current_balance = current_balance + 
        CASE 
          WHEN NEW.type = 'income' THEN NEW.amount
          ELSE -NEW.amount
        END
      WHERE id = NEW.bank_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.bank_account_id IS NOT NULL THEN
      UPDATE bank_accounts
      SET current_balance = current_balance - 
        CASE 
          WHEN OLD.type = 'income' THEN OLD.amount
          ELSE -OLD.amount
        END
      WHERE id = OLD.bank_account_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger to update balances on transaction changes
CREATE TRIGGER update_account_balance_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();