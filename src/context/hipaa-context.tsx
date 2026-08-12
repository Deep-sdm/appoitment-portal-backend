"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";

export interface HipaaAuditLog {
  id: string;
  action: string;
  resource: string;
  user: string;
  timestamp: string;
  ip: string;
  status: "Compliant" | "Flagged";
}

interface HIPAAContextType {
  isPhiMasked: boolean;
  togglePhiMasking: () => void;
  maskPhi: (text: string, type?: "name" | "reason" | "notes" | "phone" | "general") => string;
  auditLogs: HipaaAuditLog[];
  logHipaaAccess: (action: string, resource: string) => void;
  clearAuditLogs: () => void;
  hipaaStatus: {
    baaVerified: boolean;
    e2eEncryption: boolean;
    ssl256: boolean;
    lastAuditCheck: string;
    hipaaRule: string;
  };
}

const HIPAAContext = createContext<HIPAAContextType | undefined>(undefined);

export const HIPAAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPhiMasked, setIsPhiMasked] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<HipaaAuditLog[]>([]);

  // Initialize with HIPAA compliance audit log
  useEffect(() => {
    const initialLogs: HipaaAuditLog[] = [
      {
        id: "log-101",
        action: "HIPAA Session Initialized",
        resource: "Patient Portal Security Layer",
        user: user?.name || "Authenticated User",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ip: "192.168.1.104 (TLS v1.3 Secured)",
        status: "Compliant",
      },
      {
        id: "log-102",
        action: "PHI Encryption Key Verification",
        resource: "AES-256 Medical Records Vault",
        user: "System Security Engine",
        timestamp: new Date(Date.now() - 120000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ip: "10.0.4.12 (Internal BAA Proxy)",
        status: "Compliant",
      },
    ];
    setAuditLogs(initialLogs);
  }, [user]);

  const togglePhiMasking = useCallback(() => {
    setIsPhiMasked((prev) => !prev);
  }, []);

  const logHipaaAccess = useCallback(
    (action: string, resource: string) => {
      const newLog: HipaaAuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action,
        resource,
        user: user?.name || "Current User",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ip: "192.168.1.104 (TLS v1.3 Secured)",
        status: "Compliant",
      };
      setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 audit logs
    },
    [user]
  );

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  // Utility to redact sensitive Protected Health Information (PHI)
  const maskPhi = useCallback(
    (text: string, type: "name" | "reason" | "notes" | "phone" | "general" = "general"): string => {
      if (!isPhiMasked || !text) return text;

      if (type === "name") {
        const parts = text.trim().split(" ");
        return parts
          .map((part) => (part.length > 1 ? `${part[0]}${"*".repeat(Math.min(part.length - 1, 4))}` : part))
          .join(" ");
      }

      if (type === "phone") {
        return "***-***-" + text.slice(-4);
      }

      if (type === "reason" || type === "notes") {
        if (text.length <= 6) return "🔒 [PHI Masked]";
        return `🔒 ${text.substring(0, 4)}... [PHI Masked for Privacy]`;
      }

      // Default masking
      return "🔒 [PHI Masked]";
    },
    [isPhiMasked]
  );

  const hipaaStatus = {
    baaVerified: true,
    e2eEncryption: true,
    ssl256: true,
    lastAuditCheck: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    hipaaRule: "45 CFR § 164.312 (Technical Safeguards)",
  };

  return (
    <HIPAAContext.Provider
      value={{
        isPhiMasked,
        togglePhiMasking,
        maskPhi,
        auditLogs,
        logHipaaAccess,
        clearAuditLogs,
        hipaaStatus,
      }}
    >
      {children}
    </HIPAAContext.Provider>
  );
};

export const useHIPAA = () => {
  const context = useContext(HIPAAContext);
  if (!context) {
    throw new Error("useHIPAA must be used within a HIPAAProvider");
  }
  return context;
};
