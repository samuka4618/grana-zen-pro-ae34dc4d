import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrencyInput, parseCurrency } from "@/lib/currency";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onValueChange?: (numericValue: number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  onValueChange,
  placeholder = "0,00",
  disabled,
  required,
  id,
  className,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === "") {
      setDisplayValue("");
    } else if (value !== displayValue) {
      // Formata o valor quando recebido externamente
      const numericValue = parseCurrency(value);
      setDisplayValue(formatCurrencyInput(numericValue.toString()));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permite apagar completamente
    if (inputValue === "") {
      setDisplayValue("");
      onChange("");
      onValueChange?.(0);
      return;
    }

    // Formata enquanto digita
    const formatted = formatCurrencyInput(inputValue);
    setDisplayValue(formatted);
    onChange(formatted);
    
    // Envia valor numérico
    const numericValue = parseCurrency(formatted);
    onValueChange?.(numericValue);
  };

  const handleBlur = () => {
    if (displayValue === "") {
      return;
    }
    
    // Garante formatação correta ao sair do campo
    const numericValue = parseCurrency(displayValue);
    const formatted = formatCurrencyInput(numericValue.toString());
    setDisplayValue(formatted);
    onChange(formatted);
    onValueChange?.(numericValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        R$
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`pl-10 ${className || ""}`}
      />
    </div>
  );
}
