import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PendingOperation {
  id: string;
  type: "insert" | "update" | "delete";
  table: string;
  data: any;
  timestamp: number;
}

const PENDING_OPS_KEY = "pendingOperations";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Você está online!",
        description: "Sincronizando dados...",
      });
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Você está offline",
        description: "As alterações serão sincronizadas quando você voltar online.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync on mount if online
    if (navigator.onLine) {
      syncPendingOperations();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getPendingOperations = (): PendingOperation[] => {
    const stored = localStorage.getItem(PENDING_OPS_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const setPendingOperations = (ops: PendingOperation[]) => {
    localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(ops));
  };

  const addPendingOperation = (
    type: PendingOperation["type"],
    table: string,
    data: any
  ) => {
    const ops = getPendingOperations();
    ops.push({
      id: `${Date.now()}-${Math.random()}`,
      type,
      table,
      data,
      timestamp: Date.now(),
    });
    setPendingOperations(ops);
  };

  const syncPendingOperations = async () => {
    if (!navigator.onLine || isSyncing) return;

    const ops = getPendingOperations();
    if (ops.length === 0) return;

    setIsSyncing(true);

    try {
      for (const op of ops) {
        try {
          switch (op.type) {
            case "insert":
              await (supabase as any).from(op.table).insert(op.data);
              break;
            case "update":
              await (supabase as any)
                .from(op.table)
                .update(op.data)
                .eq("id", op.data.id);
              break;
            case "delete":
              await (supabase as any).from(op.table).delete().eq("id", op.data.id);
              break;
          }
        } catch (error) {
          console.error(`Failed to sync operation ${op.id}:`, error);
          // Keep failed operations for retry
          continue;
        }
      }

      // Clear successful operations
      setPendingOperations([]);

      toast({
        title: "Sincronização completa!",
        description: "Todos os dados foram sincronizados.",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Erro na sincronização",
        description: "Tentaremos novamente em breve.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    addPendingOperation,
    syncPendingOperations,
    pendingCount: getPendingOperations().length,
  };
};

