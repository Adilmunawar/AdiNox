
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, EyeOff, Mail, User, Loader2, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  username: z.string().min(3, "Username must be at least 3 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: LoginFormValues | SignupFormValues) => Promise<void>;
  isLoading: boolean;
}

const fieldMotion = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  })
};

const AuthForm = React.memo(({ type, onSubmit, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isLogin = type === "login";
  const schema = isLogin ? loginSchema : signupSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isLogin 
      ? { email: "", password: "" }
      : { email: "", username: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const handleSubmit = useCallback(async (data: any) => {
    try { await onSubmit(data); } catch (error) { console.error("Form error:", error); }
  }, [onSubmit]);

  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { strength: 0, label: "", color: "bg-muted" };
    const checks = [password.length >= 8, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[!@#$%^&*(),.?":{}|<>]/.test(password)];
    const strength = checks.filter(Boolean).length;
    const configs = [
      { label: "Very Weak", color: "bg-destructive" },
      { label: "Weak", color: "bg-orange-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Good", color: "bg-blue-500" },
      { label: "Strong", color: "bg-emerald-500" },
    ];
    return { strength: Math.min(strength, 5), ...configs[Math.min(strength - 1, 4)] || configs[0] };
  }, []);

  const inputCls = "h-10 bg-secondary/30 border-border/40 rounded-lg placeholder:text-muted-foreground/40 text-sm transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/15 hover:border-border/60";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Email */}
        <motion.div custom={0} variants={fieldMotion} initial="hidden" animate="visible">
          <FormField control={form.control} name="email" render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-foreground/70 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-widest mb-1">
                <Mail className="h-3 w-3 text-primary/60" /> Email
              </FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" className={`${inputCls} ${fieldState.error ? 'border-destructive/50' : ''}`} type="email" {...field} disabled={isLoading} autoComplete="email" />
              </FormControl>
              <AnimatePresence>
                {fieldState.error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <FormMessage className="text-destructive text-[11px] mt-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </FormItem>
          )} />
        </motion.div>

        {/* Username */}
        {!isLogin && (
          <motion.div custom={1} variants={fieldMotion} initial="hidden" animate="visible">
            <FormField control={form.control} name="username" render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-foreground/70 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-widest mb-1">
                  <User className="h-3 w-3 text-primary/60" /> Username
                </FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" className={`${inputCls} ${fieldState.error ? 'border-destructive/50' : ''}`} {...field} disabled={isLoading} autoComplete="username" />
                </FormControl>
                <AnimatePresence>
                  {fieldState.error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <FormMessage className="text-destructive text-[11px] mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormItem>
            )} />
          </motion.div>
        )}

        {/* Password */}
        <motion.div custom={isLogin ? 1 : 2} variants={fieldMotion} initial="hidden" animate="visible">
          <FormField control={form.control} name="password" render={({ field, fieldState }) => {
            const ps = !isLogin ? getPasswordStrength(field.value) : null;
            return (
              <FormItem>
                <FormLabel className="text-foreground/70 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-widest mb-1">
                  <Lock className="h-3 w-3 text-primary/60" /> Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder={isLogin ? "Enter password" : "Create a strong password"} className={`${inputCls} pr-9 ${fieldState.error ? 'border-destructive/50' : ''}`} type={showPassword ? 'text' : 'password'} {...field} disabled={isLoading} autoComplete="current-password" />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/70 transition-colors" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </FormControl>
                <AnimatePresence>
                  {ps && field.value && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Strength</span>
                        <span className="text-[10px] font-medium text-muted-foreground/80">{ps.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${i <= ps.strength ? ps.color : 'bg-border/40'}`} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {fieldState.error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <FormMessage className="text-destructive text-[11px] mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormItem>
            );
          }} />
        </motion.div>

        {/* Confirm Password */}
        {!isLogin && (
          <motion.div custom={3} variants={fieldMotion} initial="hidden" animate="visible">
            <FormField control={form.control} name="confirmPassword" render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-foreground/70 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-widest mb-1">
                  <CheckCircle2 className="h-3 w-3 text-primary/60" /> Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Confirm your password" className={`${inputCls} pr-9 ${fieldState.error ? 'border-destructive/50' : ''}`} type={showConfirmPassword ? 'text' : 'password'} {...field} disabled={isLoading} autoComplete="new-password" />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/70 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </FormControl>
                <AnimatePresence>
                  {fieldState.error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <FormMessage className="text-destructive text-[11px] mt-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormItem>
            )} />
          </motion.div>
        )}
        
        {/* Submit */}
        <motion.div custom={isLogin ? 2 : 4} variants={fieldMotion} initial="hidden" animate="visible" className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 group btn-premium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </motion.div>

        {/* Social Login Placeholders */}
        <motion.div custom={isLogin ? 3 : 5} variants={fieldMotion} initial="hidden" animate="visible" className="pt-1">
          <div className="relative flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs gap-2 opacity-50 cursor-not-allowed" disabled>
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Coming Soon</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs gap-2 opacity-50 cursor-not-allowed" disabled>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    GitHub
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Coming Soon</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </form>
    </Form>
  );
});

AuthForm.displayName = "AuthForm";
export default AuthForm;
