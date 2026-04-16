import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BusinessNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🔍</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Business not found</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        The booking page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Link href="/">
        <Button variant="outline">Back to Home</Button>
      </Link>
    </div>
  );
}
