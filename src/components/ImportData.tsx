import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, XCircle, Download } from "lucide-react";
import { parseCSV, ParsedTransaction } from "@/lib/parsers/csvParser";
import { parseOFX } from "@/lib/parsers/ofxParser";
import { useTransactionsStore } from "@/hooks/useTransactionsStore";
import { useCategoriesStore } from "@/hooks/useCategoriesStore";
import { toast } from "sonner";

export function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [importing, setImporting] = useState(false);
  const { addTransaction } = useTransactionsStore(new Date());
  const { categories } = useCategoriesStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let parsed: ParsedTransaction[] = [];

      if (file.name.endsWith('.csv')) {
        parsed = parseCSV(content);
      } else if (file.name.endsWith('.ofx')) {
        parsed = parseOFX(content);
      }

      setParsedData(parsed);
      if (parsed.length > 0) {
        toast.success(`${parsed.length} transações encontradas`);
      } else {
        toast.error("Nenhuma transação válida encontrada no arquivo");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("Nenhuma transação para importar");
      return;
    }

    setImporting(true);
    let successCount = 0;

    for (const transaction of parsedData) {
      try {
        await addTransaction(
          transaction.description,
          transaction.amount,
          transaction.category,
          transaction.type,
          transaction.date
        );
        successCount++;
      } catch (error) {
        console.error("Error importing transaction:", error);
      }
    }

    setImporting(false);
    if (successCount > 0) {
      toast.success(`${successCount} transações importadas com sucesso!`);
      setParsedData([]);
      setFile(null);
    } else {
      toast.error("Erro ao importar transações");
    }
  };

  const updateCategory = (index: number, category: string) => {
    const updated = [...parsedData];
    updated[index].category = category;
    setParsedData(updated);
  };

  const downloadTemplate = () => {
    const template = `data,descricao,valor,categoria
2024-01-15,Salário,5000.00,Salário
2024-01-16,Supermercado,-250.50,Alimentação
2024-01-17,Netflix,-45.90,Entretenimento`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_importacao.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Importar Transações
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Suporte para arquivos CSV e OFX (extrato bancário)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar Modelo CSV
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Selecione o arquivo</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.ofx"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: CSV, OFX
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
              <Badge variant="outline" className="ml-auto">
                {parsedData.length} transações
              </Badge>
            </div>
          )}
        </div>

        {parsedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Pré-visualização</h4>
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Importar Todas
                  </>
                )}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-sm">{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) => updateCategory(index, value)}
                          >
                            <SelectTrigger className="w-[150px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories
                                .filter(c => c.type === transaction.type)
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {!file && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Arraste um arquivo ou clique no botão acima para selecionar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
