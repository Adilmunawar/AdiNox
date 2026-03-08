
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
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
      </form>
    </Form>
  );
});

AuthForm.displayName = "AuthForm";
export default AuthForm;
