"use client";

import { useState } from "react";
import { useHIPAA } from "@/context/hipaa-context";
import { ShieldCheck, Eye, EyeOff, FileText, Lock, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function HIPAABadgeBar() {
  const { isPhiMasked, togglePhiMasking, auditLogs, hipaaStatus, logHipaaAccess } = useHIPAA();
  const [isOpenLogs, setIsOpenLogs] = useState(false);

  const handleOpenAudit = () => {
    setIsOpenLogs(true);
    logHipaaAccess("Viewed Security Audit Logs", "HIPAA Audit Viewer Drawer");
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-emerald-100 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 shadow-xs backdrop-blur-md">
      {/* Left Compliance Specs */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>HIPAA Compliant</span>
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-200/90 font-medium">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>AES-256 Encrypted</span>
        </span>

        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-teal-300/80 font-medium">
          <CheckCircle2 className="w-3 h-3 text-teal-400" />
          <span>BAA Agreement Active ({hipaaStatus.hipaaRule})</span>
        </span>
      </div>

      {/* Right Controls: PHI Masking Switch & Audit Log Viewer */}
      <div className="flex items-center gap-2">
        {/* PHI Masking Quick Switch */}
        <Button
          variant="outline"
          size="sm"
          onClick={togglePhiMasking}
          className={`h-7 px-2.5 rounded-xl text-[11px] font-black border transition-all duration-200 ${
            isPhiMasked
              ? "bg-amber-500 text-amber-950 border-amber-400 shadow-sm animate-pulse"
              : "bg-emerald-900/60 text-emerald-200 border-emerald-500/40 hover:bg-emerald-800/80"
          }`}
          title="Toggle Protected Health Information (PHI) Masking for public privacy"
        >
          {isPhiMasked ? (
            <>
              <EyeOff className="w-3 h-3 mr-1 text-amber-950" />
              PHI Masked (ON)
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1 text-emerald-400" />
              PHI Masking (OFF)
            </>
          )}
        </Button>

        {/* HIPAA Access Audit Logs Modal Trigger */}
        <Dialog open={isOpenLogs} onOpenChange={setIsOpenLogs}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAudit}
                className="h-7 px-2.5 rounded-xl text-[11px] font-extrabold text-emerald-300 hover:text-white hover:bg-emerald-500/20"
              >
                <FileText className="w-3 h-3 mr-1 text-emerald-400" />
                Audit Logs ({auditLogs.length})
              </Button>
            }
          />
          <DialogContent className="max-w-2xl rounded-3xl border-emerald-500/30 bg-slate-950 text-white p-6 shadow-2xl">
            <DialogHeader className="space-y-1.5 border-b border-emerald-500/20 pb-4">
              <DialogTitle className="text-xl font-black flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                HIPAA Security Access Audit Trail
              </DialogTitle>
              <DialogDescription className="text-xs text-emerald-200/80 font-medium">
                Compliant with 45 CFR § 164.312(b) Audit Controls. All accesses to medical records and PHI are logged immutably.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-xs p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-black">Encryption Engine</span>
                  <p className="font-extrabold text-emerald-100">TLS v1.3 / AES-256</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-black">Audit Status</span>
                  <p className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Compliant
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-black">BAA Signatory</span>
                  <p className="font-extrabold text-emerald-100">Verified Active</p>
                </div>
              </div>

              {/* Log List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-500/10">
                {auditLogs.map((log) => (
                  <div key={log.id} className="pt-2 text-xs flex items-center justify-between gap-3">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-300 truncate">{log.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-md font-bold">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Resource: <span className="text-slate-300 font-semibold">{log.resource}</span> • User: {log.user}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium block">{log.timestamp}</span>
                      <span className="text-[9px] text-emerald-500/80 font-mono">{log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
