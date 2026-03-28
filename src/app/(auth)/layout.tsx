export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
