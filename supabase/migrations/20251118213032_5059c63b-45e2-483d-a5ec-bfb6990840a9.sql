-- Create table for budgets
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  month DATE NOT NULL,
  planned_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, month)
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own and shared budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id OR public.has_shared_access(auth.uid(), user_id));

CREATE POLICY "Users can create budgets if they have editor access"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can update budgets if they have editor access"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'editor'));

CREATE POLICY "Users can delete budgets if they have admin access"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), user_id, 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_budgets_user_month ON public.budgets(user_id, month);
CREATE INDEX idx_budgets_category ON public.budgets(category);