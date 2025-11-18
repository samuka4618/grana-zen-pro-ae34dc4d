import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AttachmentViewerProps {
  attachmentUrl: string;
}

export function AttachmentViewer({ attachmentUrl }: AttachmentViewerProps) {
  const [open, setOpen] = useState(false);
  const isPdf = attachmentUrl.endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(attachmentUrl);

  const getPublicUrl = () => {
    const { data } = supabase.storage
      .from('financial-attachments')
      .getPublicUrl(attachmentUrl);
    return data.publicUrl;
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('financial-attachments')
        .download(attachmentUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachmentUrl.split('/').pop() || 'anexo';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(getPublicUrl(), '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          {isPdf ? (
            <FileText className="h-4 w-4 text-danger" />
          ) : (
            <ImageIcon className="h-4 w-4 text-primary" />
          )}
          <Eye className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Visualizar Anexo</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Nova Aba
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-auto max-h-[70vh]">
          {isImage && (
            <img
              src={getPublicUrl()}
              alt="Anexo"
              className="w-full h-auto rounded-lg"
            />
          )}
          
          {isPdf && (
            <iframe
              src={getPublicUrl()}
              className="w-full h-[70vh] rounded-lg border"
              title="PDF Viewer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
