import { useFinance } from "@/context/FinanceContext";
import { Cloud, CloudOff, Loader2, CheckCircle2 } from "lucide-react";

export default function PageHeader({ title, subtitle, action }) {
  const { isOffline, backendReady } = useFinance();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          <div className="flex items-center">
            {!backendReady && !isOffline ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing...
              </div>
            ) : isOffline ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/10 text-[10px] font-medium text-warning border border-warning/20">
                <CloudOff className="h-3 w-3" />
                Offline Mode
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-[10px] font-medium text-success border border-success/20">
                <Cloud className="h-3 w-3" />
                <CheckCircle2 className="h-2 w-2 absolute bottom-0 right-0" />
                Cloud Synced
              </div>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
