-- Create investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  ticker_symbol TEXT,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create policies for investments
CREATE POLICY "Users can view their own and shared investments"
ON public.investments
FOR SELECT
USING (auth.uid() = user_id OR has_shared_access(auth.uid(), user_id));

CREATE POLICY "Users can create investments if they have editor access"
ON public.investments
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_permission(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can update investments if they have editor access"
ON public.investments
FOR UPDATE
USING (auth.uid() = user_id OR has_permission(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can delete investments if they have admin access"
ON public.investments
FOR DELETE
USING (auth.uid() = user_id OR has_permission(auth.uid(), user_id, 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_type ON public.investments(type);