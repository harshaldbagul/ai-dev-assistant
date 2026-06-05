import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <p className="text-zinc-400">Page not found</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </div>
  );
}
