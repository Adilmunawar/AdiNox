import React from 'react';
import { Shield, Lock, Fingerprint, Cloud, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthContainerProps {
  children: React.ReactNode;
}

const features = [
  { icon: Shield, title: "Military-Grade Encryption", desc: "AES-256 encryption protects every credential" },
  { icon: Fingerprint, title: "Biometric Ready", desc: "Secure access with fingerprint & face ID" },
  { icon: Cloud, title: "Cloud Sync", desc: "Encrypted sync across all your devices" },
  { icon: Zap, title: "Instant 2FA Codes", desc: "TOTP tokens generated in real-time" },
];

const stagger = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }),
};

const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-primary/[0.03] via-background to-background">
        {/* Background effects */}
        <motion.div
          className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.08), transparent 60%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.05), transparent 60%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 0.5px, transparent 0.5px)',
          backgroundSize: '28px 28px'
        }} />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Adi<span className="text-primary">Nox</span>
                </h1>
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.25em]">Security Vault</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
              Your digital life,
              <br />
              <span className="text-gradient">protected.</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-[340px]">
              Enterprise-grade security for passwords, 2FA tokens, cards, and sensitive notes — all in one vault.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/[0.06] border border-primary/10 flex items-center justify-center shrink-0 group-hover:border-primary/20 group-hover:bg-primary/[0.1] transition-colors duration-300">
                  <f.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="relative z-10 mt-auto pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">SOC 2 Compliant</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-4">
            &copy; {new Date().getFullYear()} AdiNox — Developed by <span className="text-primary">Adil Munawar</span>
          </p>
        </motion.div>
      </div>

      {/* Divider line */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-border to-transparent" />

      {/* Right auth form panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(circle, hsl(168 76% 42% / 0.05), transparent 70%)' }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }} />

        <main className="relative z-10 flex items-center justify-center flex-1 p-4 sm:p-8">
          <motion.div
            className="w-full max-w-[420px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="lg:hidden relative z-10 py-4 border-t border-border">
          <p className="text-center text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} AdiNox — Developed by <span className="text-primary">Adil Munawar</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthContainer;
