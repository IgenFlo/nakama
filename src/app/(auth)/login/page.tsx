import Image from "next/image";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(76,16,54,0.2)]">
          <Image
            src="/apple-touch-icon.png"
            alt="Nakama"
            width={80}
            height={80}
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Nakama
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">Notre espace à nous</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="w-full rounded-2xl bg-white border border-onyx/8 shadow-[0_2px_16px_rgba(7,14,13,0.08)] p-6">
        <LoginForm />
      </div>
    </div>
  );
}
