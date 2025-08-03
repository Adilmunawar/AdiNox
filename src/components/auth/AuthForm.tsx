
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
import { Eye, EyeOff, KeyRound, Mail, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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

const AuthForm = React.memo(({ type, onSubmit, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    if (!password) return { strength: 0, label: "", color: "", bgColor: "" };
    
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
      { label: "Very Weak", color: "text-red-400", bgColor: "bg-red-400" },
      { label: "Weak", color: "text-orange-400", bgColor: "bg-orange-400" },
      { label: "Fair", color: "text-yellow-400", bgColor: "bg-yellow-400" },
      { label: "Good", color: "text-blue-400", bgColor: "bg-blue-400" },
      { label: "Strong", color: "text-green-400", bgColor: "bg-green-400" },
    ];
    
    const config = configs[Math.min(strength - 1, 4)] || configs[0];
    
    return {
      strength: Math.min(strength, 5),
      ...config
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 font-medium flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your email address"
                        className={`h-12 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 font-medium transition-all duration-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 ${
                          fieldState.error 
                            ? 'border-red-500/50 focus:ring-red-500/50' 
                            : 'border-slate-700/50 hover:border-slate-600/50'
                        }`}
                        type="email"
                        {...field}
                        disabled={isLoading}
                        autoComplete="email"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                      {!fieldState.error && field.value && field.value.includes('@') && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm">
                          <AlertCircle className="h-3 w-3" />
                          {fieldState.error.message}
                        </FormMessage>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Username Field (Signup only) */}
          {!isLogin && (
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200 font-medium flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-400" />
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Choose your username"
                          className={`h-12 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 font-medium transition-all duration-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 ${
                            fieldState.error 
                              ? 'border-red-500/50 focus:ring-red-500/50' 
                              : 'border-slate-700/50 hover:border-slate-600/50'
                          }`}
                          {...field}
                          disabled={isLoading}
                          autoComplete="username"
                          onFocus={() => setFocusedField('username')}
                          onBlur={() => setFocusedField(null)}
                        />
                        {!fieldState.error && field.value && field.value.length >= 3 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm">
                            <AlertCircle className="h-3 w-3" />
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
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => {
                const passwordStrength = !isLogin ? getPasswordStrength(field.value) : null;
                
                return (
                  <FormItem>
                    <FormLabel className="text-slate-200 font-medium flex items-center gap-2 mb-2">
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                          className={`h-12 pr-12 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 font-medium transition-all duration-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 ${
                            fieldState.error 
                              ? 'border-red-500/50 focus:ring-red-500/50' 
                              : 'border-slate-700/50 hover:border-slate-600/50'
                          }`}
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                          disabled={isLoading}
                          autoComplete="current-password"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && field.value && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Password Strength</span>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className={`h-full ${passwordStrength.bgColor} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm">
                            <AlertCircle className="h-3 w-3" />
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

          {/* Confirm Password Field (Signup only) */}
          {!isLogin && (
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200 font-medium flex items-center gap-2 mb-2">
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Confirm your password"
                          className={`h-12 pr-12 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 font-medium transition-all duration-200 focus:ring-2 focus:ring-slate-600 focus:border-slate-600 ${
                            fieldState.error 
                              ? 'border-red-500/50 focus:ring-red-500/50' 
                              : 'border-slate-700/50 hover:border-slate-600/50'
                          }`}
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...field}
                          disabled={isLoading}
                          autoComplete="new-password"
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {!fieldState.error && field.value && form.watch('password') === field.value && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm">
                            <AlertCircle className="h-3 w-3" />
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
          <motion.div variants={itemVariants} className="pt-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full h-12 font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 hover:border-slate-600 transition-all duration-200 rounded-lg disabled:opacity-50"
                disabled={isLoading}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
