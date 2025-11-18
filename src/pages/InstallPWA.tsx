import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  Download,
  CheckCircle,
  Share,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            Instalar Grana Zen Pro
          </h1>
          <p className="text-muted-foreground">
            Instale nosso app para ter acesso rápido e funcionalidades offline
          </p>
        </div>

        {isInstalled ? (
          <Card className="p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">App já instalado!</h2>
            <p className="text-muted-foreground">
              O Grana Zen Pro está instalado no seu dispositivo.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para o App
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Benefícios</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Acesso rápido direto da tela inicial do seu celular
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Funciona offline - registre suas transações sem internet
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Sincronização automática quando voltar online
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Notificações para lembretes e metas financeiras</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Carregamento mais rápido</span>
                  </li>
                </ul>
              </div>
            </Card>

            {isIOS ? (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Como instalar no iPhone</h2>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="flex items-start gap-2">
                    <span className="font-medium">1.</span>
                    <div className="flex-1">
                      Toque no botão <Share className="inline h-4 w-4 mx-1" />{" "}
                      (Compartilhar) na parte inferior do Safari
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">2.</span>
                    <span className="flex-1">
                      Role para baixo e selecione "Adicionar à Tela Inicial"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium">3.</span>
                    <span className="flex-1">
                      Toque em "Adicionar" no canto superior direito
                    </span>
                  </li>
                </ol>
              </Card>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} size="lg" className="w-full">
                <Download className="h-5 w-5 mr-2" />
                Instalar App
              </Button>
            ) : (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                  Como instalar no Android
                </h2>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Abra o menu do navegador (⋮)</li>
                  <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                  <li>Confirme a instalação</li>
                </ol>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
