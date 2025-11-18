import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AttachmentUploadProps {
  onUploadComplete: (url: string) => void;
  currentAttachment?: string;
  onRemove?: () => void;
}

export function AttachmentUpload({ onUploadComplete, currentAttachment, onRemove }: AttachmentUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAttachment || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.");
      return;
    }

    // Validar tamanho (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 20MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('financial-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('financial-attachments')
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onUploadComplete(fileName);
      toast.success("Arquivo anexado com sucesso");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };

  const getFileIcon = (url: string) => {
    if (url.endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-danger" />;
    }
    return <ImageIcon className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="space-y-2">
      <Label>Anexo (Comprovante ou Nota Fiscal)</Label>
      
      {preview ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          {getFileIcon(preview)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {preview.split('/').pop()}
            </p>
            <p className="text-xs text-muted-foreground">Anexo adicionado</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="attachment-upload"
          />
          <Label
            htmlFor="attachment-upload"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4" />
                Clique para anexar arquivo
              </>
            )}
          </Label>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WEBP ou PDF. Máximo 20MB.
      </p>
    </div>
  );
}
