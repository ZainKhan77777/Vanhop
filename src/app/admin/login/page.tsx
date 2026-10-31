"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginDto, type LoginDto } from "@/features/auth/dto/login.dto";
import { useLogin } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/ui/error-note";
import { cn } from "@/lib/format";

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const [shake, setShake] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginDto),
    defaultValues: { email: "", password: "" },
  });

  function submit(values: LoginDto): void {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(params.get("next") ?? ROUTES.admin);
        router.refresh();
      },
      onError: () => setShake((s) => s + 1),
    });
  }

  return (
    <main className="grid min-h-screen place-items-center px-6 py-14">
      <form
        key={shake}
        onSubmit={handleSubmit(submit)}
        noValidate
        className={cn("w-full max-w-[400px] animate-lift rounded-xl2 bg-white p-8 text-navy-900 shadow-md2",
          shake > 0 && "animate-shake")}
      >
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-[13px] bg-navy-900 text-lg font-extrabold text-white">V</span>
        <h1 className="text-[27px]">Staff sign in</h1>
        <p className="mb-6 mt-1.5 text-sm text-muted">The reservations dashboard is for VanHop staff.</p>

        <div className="space-y-4">
          <Input label="Email" type="email" autoComplete="username" placeholder="you@vanhop.ge"
            error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••"
            error={errors.password?.message} {...register("password")} />
        </div>

        {login.isError && <div className="mt-4"><ErrorNote message={login.error.message} /></div>}

        <Button type="submit" full className="mt-5" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="mt-5 text-center text-[12.5px] leading-relaxed text-muted">
          Seeded account — set <b className="font-semibold text-navy-900">ADMIN_EMAIL</b> and{" "}
          <b className="font-semibold text-navy-900">ADMIN_PASSWORD</b> in your env file.
        </p>
      </form>
    </main>
  );
}
