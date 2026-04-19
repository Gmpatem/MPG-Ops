import { PageTransition } from '@/components/page-transition';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted/30 p-4 px-safe">
      <div className="w-full max-w-sm">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
