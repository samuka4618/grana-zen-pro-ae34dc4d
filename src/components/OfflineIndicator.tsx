import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, syncPendingOperations, pendingCount } =
    useOfflineSync();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2"
      >
        {isOnline ? (
          <>
            <Cloud className="h-4 w-4" />
            <span>Online</span>
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            <span>Offline</span>
          </>
        )}
        {pendingCount > 0 && (
          <>
            <span className="text-xs">({pendingCount} pendentes)</span>
            {isOnline && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={syncPendingOperations}
                disabled={isSyncing}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </>
        )}
      </Badge>
    </div>
  );
};
