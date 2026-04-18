"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";

function AuthField({
  icon,
  children
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a59faf]">{icon}</span>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, googleInitiate } = useAppMutations();
  const [email, setEmail] = useState("organizer@eventchimp.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue with EventChimp"
      promoTitle={
        <>
          Organize the
          <br />
          Best Events
        </>
      }
      footer={
        <p className="text-sm text-[#251d30]">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-[#4b2a76]">
            Create account
          </Link>
        </p>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await login.mutateAsync({ email, password });
          router.push(response.data.user.role === "admin" ? "/admin" : "/dashboard");
        }}
      >
        <AuthField icon={<Mail className="h-4 w-4" />}>
          <Input
            className="pl-11 pr-4"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </AuthField>
        <AuthField icon={<Lock className="h-4 w-4" />}>
          <>
            <Input
              type={showPassword ? "text" : "password"}
              className="pl-11 pr-11"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a59faf] transition hover:text-[#6f697b]"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </>
        </AuthField>
        <Button type="submit" className="w-full" variant="pill" size="lg" disabled={login.isPending}>
          {login.isPending ? "Continue" : "Continue"}
        </Button>
      </form>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e4deee]" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aaa3b3]">or</span>
        <div className="h-px flex-1 bg-[#e4deee]" />
      </div>
      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full rounded-full"
        onClick={async () => {
          const response = await googleInitiate.mutateAsync();
          window.location.href = response.data.authUrl;
        }}
      >
        <Sparkles className="h-4 w-4 text-accent" />
        Continue with Google
      </Button>
    </AuthShell>
  );
}
