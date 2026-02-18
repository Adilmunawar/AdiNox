
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, User, Loader2, AlertCircle, Shield, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  username: z.string().min(3, "Username must be at least 3 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number."),
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

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
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
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }, [onSubmit]);

  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { strength: 0, label: "", color: "bg-muted" };
    
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    const configs = [
      { label: "Very Weak", color: "bg-destructive" },
      { label: "Weak", color: "bg-orange-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Good", color: "bg-blue-500" },
      { label: "Strong", color: "bg-green-500" },
    ];
    
    const config = configs[Math.min(strength - 1, 4)] || configs[0];
    
    return {
      strength: Math.min(strength, 5),
      ...config
    };
  }, []);

  const inputClasses = (hasError: boolean) => 
    `h-11 bg-secondary/30 border border-border/50 rounded-xl placeholder:text-muted-foreground/50 transition-all duration-200 text-sm ${
      hasError 
        ? 'border-destructive/50 focus:border-destructive' 
        : 'focus:border-primary/60 hover:border-border/80'
    } focus:ring-1 focus:ring-primary/20 focus:ring-offset-0`;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Email Field */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary/70" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="you@example.com"
                      className={inputClasses(!!fieldState.error)}
                      type="email"
                      {...field}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </FormControl>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <FormMessage className="text-destructive flex items-center gap-1.5 text-xs mt-1.5">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          {fieldState.error.message}
                        </FormMessage>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Username Field */}
          {!isLogin && (
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5">
                      <User className="h-3.5 w-3.5 text-primary/70" />
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Choose a username"
                        className={inputClasses(!!fieldState.error)}
                        {...field}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <FormMessage className="text-destructive flex items-center gap-1.5 text-xs mt-1.5">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            {fieldState.error.message}
                          </FormMessage>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {/* Password Field */}
          <motion.div custom={isLogin ? 1 : 2} variants={fieldVariants} initial="hidden" animate="visible">
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => {
                const passwordStrength = !isLogin ? getPasswordStrength(field.value) : null;
                
                return (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary/70" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isLogin ? "Enter password" : "Create a strong password"}
                          className={`${inputClasses(!!fieldState.error)} pr-10`}
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    
                    {/* Password Strength */}
                    <AnimatePresence>
                      {passwordStrength && field.value && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Strength</span>
                            <span className="text-[10px] font-semibold text-muted-foreground">{passwordStrength.label}</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <motion.div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                  i <= passwordStrength.strength ? passwordStrength.color : 'bg-secondary'
                                }`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: i * 0.05 }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <FormMessage className="text-destructive flex items-center gap-1.5 text-xs mt-1.5">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            {fieldState.error.message}
                          </FormMessage>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </FormItem>
                );
              }}
            />
          </motion.div>

          {/* Confirm Password */}
          {!isLogin && (
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" />
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Confirm your password"
                          className={`${inputClasses(!!fieldState.error)} pr-10`}
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...field}
                          disabled={isLoading}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <FormMessage className="text-destructive flex items-center gap-1.5 text-xs mt-1.5">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            {fieldState.error.message}
                          </FormMessage>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </FormItem>
                )}
              />
            </motion.div>
          )}
          
          {/* Submit Button */}
          <motion.div 
            custom={isLogin ? 2 : 4} 
            variants={fieldVariants} 
            initial="hidden" 
            animate="visible"
            className="pt-3"
          >
            <Button 
              type="submit" 
              className="w-full h-12 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 disabled:opacity-40 shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 group relative overflow-hidden"
              disabled={isLoading}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
