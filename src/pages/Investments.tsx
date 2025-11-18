import { InvestmentsManager } from "@/components/InvestmentsManager";
import { InvestmentPortfolio } from "@/components/InvestmentPortfolio";
import { InvestmentDiversification } from "@/components/InvestmentDiversification";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Investments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Investimentos</h1>
              <p className="text-muted-foreground">
                Acompanhe sua carteira e rentabilidade
              </p>
            </div>
          </div>
          <InvestmentsManager />
        </div>

        <InvestmentPortfolio />

        <InvestmentDiversification />
      </div>
    </div>
  );
};

export default Investments;
