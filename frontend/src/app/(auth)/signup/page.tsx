"use client";

import Link from "next/link";
import { AlertCircle, Eye, EyeOff, LoaderCircle, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { getRequestErrorMessage } from "@/lib/utils";

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

export default function SignupPage() {
  const router = useRouter();
  const { register, googleInitiate } = useAppMutations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const buildNameFromEmail = (value: string) => {
    const prefix = value.split("@")[0] ?? "EventChimp User";
    const formatted = prefix
      .replace(/[._-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
    return formatted || "EventChimp User";
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle="Get started with EventChimp"
      promoTitle={
        <>
          Organize the
          <br />
          Best Events
        </>
      }
      footer={
        <p className="text-sm text-[#251d30]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#4b2a76]">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex items-center gap-3 rounded-[16px] bg-[#f3f2f6] px-4 py-3 text-sm text-[#2c2437]">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-accent shadow-soft">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-ink">Organizer workspace included</p>
          <p className="text-xs text-[#7f778c]">Every account gets dashboard access automatically.</p>
        </div>
      </div>
      {register.isError || googleInitiate.isError ? (
        <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-[#f2c9cf] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a3041]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{getRequestErrorMessage(register.error ?? googleInitiate.error, "We couldn't create your account right now.")}</p>
        </div>
      ) : null}
      <form
        className="mt-7 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await register.mutateAsync({
            name: buildNameFromEmail(email),
            email,
            password,
            role: "organizer"
          });
          router.push(response.data.user.role === "admin" ? "/admin" : "/dashboard");
        }}
      >
        <AuthField icon={<Mail className="h-4 w-4" />}>
          <Input
            className="pl-11 pr-4"
            placeholder="Email address"
            value={email}
            onChange={(event) => {
              if (register.isError) {
                register.reset();
              }
              if (googleInitiate.isError) {
                googleInitiate.reset();
              }
              setEmail(event.target.value);
            }}
          />
        </AuthField>
        <AuthField icon={<Lock className="h-4 w-4" />}>
          <>
            <Input
              type={showPassword ? "text" : "password"}
              className="pl-11 pr-11"
              placeholder="Password"
              value={password}
              onChange={(event) => {
                if (register.isError) {
                  register.reset();
                }
                if (googleInitiate.isError) {
                  googleInitiate.reset();
                }
                setPassword(event.target.value);
              }}
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
        <Button type="submit" className="mt-3 w-full" variant="pill" size="lg" disabled={register.isPending}>
          {register.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Continue
        </Button>
        <div className="flex items-center gap-3 pt-1">
          <div className="h-px flex-1 bg-[#e4deee]" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#aaa3b3]">or</span>
          <div className="h-px flex-1 bg-[#e4deee]" />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full"
          disabled={googleInitiate.isPending}
          onClick={async () => {
            const response = await googleInitiate.mutateAsync();
            window.location.href = response.data.authUrl;
          }}
        >
          {googleInitiate.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
          Sign up with Google
        </Button>
      </form>
    </AuthShell>
  );
}
