import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { loginSchema } from 'shared/schemas';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/card';
import { Alert } from '@components/ui/alert';

function LoginPage() {
  const { login, resendVerification, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setResendMessage('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      const typedErr = err as Error & { code?: string };
      setError(typedErr.message);
      setErrorCode(typedErr.code ?? '');
    }
  }

  async function handleResendVerification() {
    try {
      await resendVerification(email);
      setResendMessage('Verification email sent! Check your inbox.');
    } catch {
      setResendMessage('Failed to resend verification email.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Log in to continue your reflections</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <div>
                  <p>{error}</p>
                  {errorCode === 'EMAIL_NOT_VERIFIED' && (
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={handleResendVerification}
                    >
                      Resend verification email
                    </Button>
                  )}
                  {errorCode === 'RATE_LIMIT_EXCEEDED' && (
                    <p className="text-xs mt-1">Please try again later.</p>
                  )}
                </div>
              </Alert>
            )}
            {resendMessage && (
              <Alert variant="success">{resendMessage}</Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <div className="flex justify-between w-full text-sm">
              <Link
                to="/forgot-password"
                className="text-[var(--color-muted-foreground)] hover:underline"
              >
                Forgot password?
              </Link>
              <Link
                to="/signup"
                className="text-[var(--color-primary)] hover:underline"
              >
                Create account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
