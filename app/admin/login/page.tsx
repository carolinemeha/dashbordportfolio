'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User, KeyRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error ?? 'Email ou mot de passe incorrect');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden p-4">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[bottom_1px_center]" />
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 25, stiffness: 200 }}
        className="max-w-md w-full z-10 relative"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-gradient-to-tr from-primary to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-6"
          >
            <Lock className="h-8 w-8 text-white relative z-10" />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Espace Sécurisé
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour accéder à l'administration
          </p>
        </div>
        
        <Card className="glass-card border-border/40 shadow-2xl backdrop-blur-xl bg-background/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Identification requise</CardTitle>
            <CardDescription>
              Entrez vos identifiants administrateur.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground/80">
                  <User className="h-4 w-4 text-muted-foreground" /> Adresse Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@portfolio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/40 border-border/50 focus-visible:ring-primary/50 h-11"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-foreground/80">
                  <KeyRound className="h-4 w-4 text-muted-foreground" /> Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/40 border-border/50 focus-visible:ring-primary/50 h-11"
                  required
                  autoComplete="current-password"
                />
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                    <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 group transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Authentification...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Se connecter <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}