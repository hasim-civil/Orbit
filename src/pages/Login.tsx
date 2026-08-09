import { useState } from 'react';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/AuroraBackground';
import { SpringButton } from '@/components/SpringButton';
import { Input } from '@/components/ui/input';
import { CreatorCredit } from '@/components/CreatorCredit';
import { login } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      trackEvent('login');
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/network-request-failed' || !navigator.onLine) {
        setError('No internet connection. Check your network and try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <AuroraBackground />
      <div className="flex w-full max-w-[380px] flex-col items-center gap-5">
        <motion.form
          className="flex w-full flex-col gap-3.5 rounded-[var(--radius-xl)] bg-neutral-0 p-8 shadow-[0_18px_48px_rgba(23,23,38,0.10),0_4px_12px_rgba(23,23,38,0.05)]"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          <h1 className="m-0 text-center text-xl font-bold">Smart Attendance</h1>
          <p className="m-0 mb-2 text-center text-sm text-neutral-600">Sign in to continue</p>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-neutral-600">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-neutral-600">
            Password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>

          {error && <p className="m-0 text-sm font-semibold text-danger">{error}</p>}

          <SpringButton type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </SpringButton>
        </motion.form>
        <CreatorCredit />
      </div>
    </div>
  );
}
