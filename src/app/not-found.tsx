import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Page Not Found
      </h1>
      
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      
      <div className="flex gap-3">
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Go Home
        </Link>
        <Link 
          href="/dashboard" 
          className={cn(buttonVariants())}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
