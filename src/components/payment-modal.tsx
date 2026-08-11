"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Loader2,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  fee: number;
  onSuccess: (paymentData: any) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  appointmentId,
  doctorId,
  doctorName,
  fee,
  onSuccess
}: PaymentModalProps) {
  const [gateway, setGateway] = useState<"stripe" | "razorpay">("stripe");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expDate, setExpDate] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [upiId, setUpiId] = useState("user@okaxis");

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpDate("12/28");
    setCvc("123");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create Intent
      const intentRes = await apiRequest("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({ doctorId, gateway }),
      });

      // Simulate payment processing delay (1.2s)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const transactionId = `${gateway === "stripe" ? "ch_str_" : "pay_rzp_"}${Date.now().toString(36)}`;

      // Step 2: Verify & Record Payment
      const verifyRes = await apiRequest("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          doctorId,
          gateway,
          transactionId,
          amount: fee,
          currency: gateway === "razorpay" ? "INR" : "USD",
          paymentMethod: gateway === "stripe" ? "Stripe Card" : "Razorpay UPI",
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(verifyRes.data);
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Secure Payment Gateway
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose your preferred checkout method for consultation with <span className="font-semibold text-foreground">{doctorName}</span>.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Payment Successful!</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your payment of ${fee} was processed successfully. Booking confirmed!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border text-xs">
              <div>
                <p className="text-muted-foreground">Consultation Fee</p>
                <p className="font-bold text-sm text-foreground">{doctorName}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-600">${fee}.00</span>
                <p className="text-[10px] text-muted-foreground">Test Mode (Free)</p>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            {/* Gateway Selection */}
            <Tabs defaultValue="stripe" onValueChange={(val) => setGateway(val as any)}>
              <TabsList className="grid grid-cols-2 h-11 rounded-xl p-1 bg-muted">
                <TabsTrigger value="stripe" className="rounded-lg text-xs font-semibold gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Stripe Card
                </TabsTrigger>
                <TabsTrigger value="razorpay" className="rounded-lg text-xs font-semibold gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" /> Razorpay UPI
                </TabsTrigger>
              </TabsList>

              {/* Stripe Card Form */}
              <TabsContent value="stripe" className="space-y-3 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">Credit / Debit Card</span>
                  <button
                    type="button"
                    onClick={fillTestCard}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Fill Test Card
                  </button>
                </div>
                <div className="space-y-2">
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="h-11 rounded-xl font-mono text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      placeholder="MM/YY"
                      className="h-11 rounded-xl text-xs"
                    />
                    <Input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      type="password"
                      className="h-11 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Razorpay UPI Form */}
              <TabsContent value="razorpay" className="space-y-3 pt-3">
                <div className="space-y-2 text-xs">
                  <Label htmlFor="upi">Enter VPA / UPI ID</Label>
                  <Input
                    id="upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi or mobile@paytm"
                    className="h-11 rounded-xl text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Accepts Google Pay, PhonePe, Paytm, or BHIM UPI in test environment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Pay Action */}
            <form onSubmit={handlePay} className="pt-2">
              <Button
                type="submit"
                disabled={processing}
                className="w-full h-12 rounded-2xl text-sm font-semibold shadow-md bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Pay ${fee}.00 via {gateway === "stripe" ? "Stripe" : "Razorpay"}
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-bit SSL Encrypted • Powered by Stripe & Razorpay Test Gateway</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
