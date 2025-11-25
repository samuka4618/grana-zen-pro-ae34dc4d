import { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary capturou um erro:", error, errorInfo);
    }

    // Aqui você pode enviar o erro para um serviço de logging
    // Ex: Sentry.captureException(error, { contexts: { react: errorInfo } });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Ops! Algo deu errado</h1>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
          </p>

          {import.meta.env.DEV && error && (
            <details className="mt-4 p-3 bg-muted rounded-md text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Detalhes do erro (apenas em desenvolvimento)
              </summary>
              <pre className="overflow-auto text-xs">
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onReset} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          <Button
            onClick={() => {
              navigate("/");
              onReset();
            }}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir para Início
          </Button>
        </div>
      </Card>
    </div>
  );
}

