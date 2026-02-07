import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useAuthStore } from '@stores/authStore';
import { Button } from '@components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/card';
import { Alert } from '@components/ui/alert';

function EmailSentPage() {
  const { resendVerification } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    if (!user?.email) return;
    setIsResending(true);
    try {
      await resendVerification(user.email);
      setMessage('Verification email resent!');
    } catch {
      setMessage('Failed to resend. Please try again later.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to{' '}
            <strong>{user?.email ?? 'your email'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <Alert variant="success">{message}</Alert>}
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Click the link in the email to verify your account.
            If you don't see it, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
          <Link
            to="/login"
            className="text-sm text-[var(--color-muted-foreground)] hover:underline"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default EmailSentPage;
