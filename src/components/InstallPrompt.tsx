import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if already installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    const hasSeenPrompt = localStorage.getItem("hasSeenInstallPrompt");

    if (!isInstalled && !hasSeenPrompt) {
      // Show prompt after 5 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("hasSeenInstallPrompt", "true");
  };

  const handleInstall = () => {
    navigate("/install");
    handleDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm">Instalar App</h3>
            <p className="text-xs text-muted-foreground">
              Instale o Grana Zen Pro e acesse suas finanças mesmo offline!
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Agora não
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
