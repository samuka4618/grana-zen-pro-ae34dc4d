import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBankAccountsStore } from "@/hooks/useBankAccountsStore";

interface AccountSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowAll?: boolean;
}

export function AccountSelector({ value, onChange, placeholder = "Selecione a conta", allowAll = false }: AccountSelectorProps) {
  const { getActiveAccounts } = useBankAccountsStore();
  const activeAccounts = getActiveAccounts();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && (
          <SelectItem value="all">Todas as Contas</SelectItem>
        )}
        {activeAccounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: account.color }}
              />
              {account.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
