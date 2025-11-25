import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];
type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];

interface PendingOperation<T extends TableName = TableName> {
  id: string;
  type: "insert" | "update" | "delete";
  table: T;
  data: TableInsert<T> | TableUpdate<T> | { id: string };
  timestamp: number;
}

const PENDING_OPS_KEY = "pendingOperations";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const getPendingOperations = (): PendingOperation[] => {
    try {
      const stored = localStorage.getItem(PENDING_OPS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as PendingOperation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Erro ao ler operações pendentes:", error);
      return [];
    }
  };

  const setPendingOperations = (ops: PendingOperation[]) => {
    try {
      localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(ops));
    } catch (error) {
      console.error("Erro ao salvar operações pendentes:", error);
    }
  };

  const syncPendingOperations = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    const ops = getPendingOperations();
    if (ops.length === 0) return;

    setIsSyncing(true);

    const failedOps: PendingOperation[] = [];

    try {
      for (const op of ops) {
        try {
          const table = supabase.from(op.table);
          
          switch (op.type) {
            case "insert": {
              const insertData = op.data as TableInsert<typeof op.table>;
              const { error } = await table.insert(insertData);
              if (error) throw error;
              break;
            }
            case "update": {
              const updateData = op.data as TableUpdate<typeof op.table> & { id: string };
              if (!updateData.id) {
                throw new Error("ID é obrigatório para atualização");
              }
              const { id, ...updateFields } = updateData;
              const { error } = await table.update(updateFields).eq("id", id);
              if (error) throw error;
              break;
            }
            case "delete": {
              const deleteData = op.data as { id: string };
              if (!deleteData.id) {
                throw new Error("ID é obrigatório para exclusão");
              }
              const { error } = await table.delete().eq("id", deleteData.id);
              if (error) throw error;
              break;
            }
          }
        } catch (error) {
          console.error(`Falha ao sincronizar operação ${op.id}:`, error);
          // Manter operações falhas para nova tentativa
          failedOps.push(op);
        }
      }

      // Salvar apenas operações que falharam
      setPendingOperations(failedOps);

      if (failedOps.length === 0) {
        toast({
          title: "Sincronização completa!",
          description: "Todos os dados foram sincronizados.",
        });
      } else {
        toast({
          title: "Sincronização parcial",
          description: `${ops.length - failedOps.length} de ${ops.length} operações sincronizadas. ${failedOps.length} falharam e serão tentadas novamente.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Tentaremos novamente em breve.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, toast]);

  const addPendingOperation = useCallback(<T extends TableName>(
    type: PendingOperation<T>["type"],
    table: T,
    data: TableInsert<T> | TableUpdate<T> | { id: string }
  ) => {
    const ops = getPendingOperations();
    ops.push({
      id: `${Date.now()}-${Math.random()}`,
      type,
      table,
      data: data as PendingOperation<T>["data"],
      timestamp: Date.now(),
    });
    setPendingOperations(ops);
  }, []);

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
  }, [syncPendingOperations, toast]);

  return {
    isOnline,
    isSyncing,
    addPendingOperation,
    syncPendingOperations,
    pendingCount: getPendingOperations().length,
  };
};

