import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      <form>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="h-12 px-4 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-primary/20 focus-visible:ring-4 transition-all"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base rounded-xl mt-2 font-medium shadow-sm">
            Send Reset Link
          </Button>
        </div>
      </form>

      <div className="text-center pt-4">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
