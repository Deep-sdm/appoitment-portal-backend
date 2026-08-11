"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, DollarSign, CheckCircle2, Receipt, ShieldCheck, Loader2, Calendar, Sparkles } from "lucide-react";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPaymentHistory() {
      try {
        setLoading(true);
        if (user) {
          const res = await apiRequest("/payments/history");
          const paymentList = res.data || [];
          setPayments(paymentList);
          const computedTotal = paymentList.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
          setTotalSpent(computedTotal);
        }
      } catch (err) {
        console.error("Error loading payment history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentHistory();
  }, [user]);

  const handleDownloadInvoice = (tx: any) => {
    const receiptContent = `================================================
MEDIBOOK HEALTHCARE PORTAL - PAYMENT RECEIPT
================================================
Invoice ID: ${tx.transactionId}
Date: ${new Date(tx.createdAt).toLocaleDateString()}
Doctor: ${tx.doctorName}
Patient: ${user?.name} (${user?.email})

Consultation Amount: $${tx.amount}.00 ${tx.currency}
Payment Gateway: ${tx.gateway?.toUpperCase()} (${tx.paymentMethod || "Card"})
Payment Status: ${tx.status?.toUpperCase()}

Thank you for choosing MediBook!
================================================`;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MediBook_Receipt_${tx.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Payments & Billing Receipts
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Review live Stripe & Razorpay transaction receipts and payment history
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Total Consultation Spend</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">${totalSpent}.00</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Across {payments.length} paid consultations</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Pending Invoices</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">$0.00</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-extrabold">All medical bills up to date</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Payment Infrastructure</CardTitle>
            <div className="w-8 h-8 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-base font-extrabold text-foreground">Stripe & Razorpay</div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">256-Bit SSL Encrypted Gateways</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="rounded-3xl border-border/70 bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-black text-foreground">Transaction History (Live Records)</CardTitle>
          <CardDescription className="text-xs font-medium">Verified Stripe and Razorpay consultation receipts</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-muted-foreground">Fetching transaction history...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((tx) => (
                <div key={tx._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-foreground">{tx.doctorName}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase">
                        {tx.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-black text-[10px] capitalize">
                        {tx.gateway}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-mono text-[11px]">Tx ID: {tx.transactionId}</p>
                    <p className="text-muted-foreground flex items-center gap-1 font-medium text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/50 sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${tx.amount}.00</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(tx)}
                      className="rounded-2xl h-10 px-3 text-xs font-bold gap-1.5 border-border/70"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2">
              <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h4 className="font-extrabold text-sm text-foreground">No transaction records found</h4>
              <p className="text-xs text-muted-foreground font-medium">Book an appointment to test the Stripe & Razorpay payment gateway.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

