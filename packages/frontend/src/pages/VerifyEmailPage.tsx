import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { Alert } from '@components/ui/alert';
import { Button } from '@components/ui/button';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token');
      return;
    }

    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus('error');
          setError(
            err instanceof Error ? err.message : 'Verification failed'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <p className="text-[var(--color-muted-foreground)]">
              Verifying your email...
            </p>
          )}
          {status === 'success' && (
            <>
              <Alert variant="success">
                Your email has been verified successfully!
              </Alert>
              <Link to="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <Alert variant="destructive">{error}</Alert>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmailPage;
