
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
import { Eye, EyeOff, Mail, User, Loader2, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react";
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
      { label: "Very Weak", color: "text-red-400", bgColor: "bg-gradient-to-r from-red-500 to-red-600" },
      { label: "Weak", color: "text-orange-400", bgColor: "bg-gradient-to-r from-orange-500 to-red-500" },
      { label: "Fair", color: "text-yellow-400", bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500" },
      { label: "Good", color: "text-blue-400", bgColor: "bg-gradient-to-r from-blue-500 to-purple-500" },
      { label: "Strong", color: "text-green-400", bgColor: "bg-gradient-to-r from-green-500 to-emerald-500" },
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Mail className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="Enter your email address"
                        className={`h-14 bg-white/10 border-2 rounded-2xl text-white placeholder:text-gray-400 font-medium transition-all duration-300 focus:bg-white/15 backdrop-blur-sm ${
                          fieldState.error 
                            ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                            : 'border-white/20 hover:border-white/30 focus:border-blue-400 focus:ring-blue-400/20'
                        } ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}
                        type="email"
                        {...field}
                        disabled={isLoading}
                        autoComplete="email"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                      {!fieldState.error && field.value && field.value.includes('@') && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <div className="p-1 bg-green-500/20 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </FormControl>
                  <AnimatePresence>
                    {fieldState.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
                    <FormLabel className="text-white font-semibold flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <User className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder="Choose your username"
                          className={`h-14 bg-white/10 border-2 rounded-2xl text-white placeholder:text-gray-400 font-medium transition-all duration-300 focus:bg-white/15 backdrop-blur-sm ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                              : 'border-white/20 hover:border-white/30 focus:border-purple-400 focus:ring-purple-400/20'
                          } ${focusedField === 'username' ? 'scale-[1.02]' : ''}`}
                          {...field}
                          disabled={isLoading}
                          autoComplete="username"
                          onFocus={() => setFocusedField('username')}
                          onBlur={() => setFocusedField(null)}
                        />
                        {!fieldState.error && field.value && field.value.length >= 3 && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            <div className="p-1 bg-green-500/20 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
                    <FormLabel className="text-white font-semibold flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Shield className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                          className={`h-14 pr-14 bg-white/10 border-2 rounded-2xl text-white placeholder:text-gray-400 font-medium transition-all duration-300 focus:bg-white/15 backdrop-blur-sm ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                              : 'border-white/20 hover:border-white/30 focus:border-indigo-400 focus:ring-indigo-400/20'
                          } ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all rounded-xl"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <motion.div
                            initial={false}
                            animate={{ rotate: showPassword ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </motion.div>
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Enhanced Password Strength Indicator */}
                    {passwordStrength && field.value && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-3 p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 font-medium flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            Password Strength
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                          <motion.div
                            className={`h-full ${passwordStrength.bgColor} rounded-full relative overflow-hidden`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                    
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
                    <FormLabel className="text-white font-semibold flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-green-500/20 rounded-lg">
                        <Shield className="h-3.5 w-3.5 text-green-400" />
                      </div>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          placeholder="Confirm your password"
                          className={`h-14 pr-14 bg-white/10 border-2 rounded-2xl text-white placeholder:text-gray-400 font-medium transition-all duration-300 focus:bg-white/15 backdrop-blur-sm ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20' 
                              : 'border-white/20 hover:border-white/30 focus:border-green-400 focus:ring-green-400/20'
                          } ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all rounded-xl"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          <motion.div
                            initial={false}
                            animate={{ rotate: showConfirmPassword ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </motion.div>
                        </Button>
                        {!fieldState.error && field.value && form.watch('password') === field.value && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-16 top-1/2 -translate-y-1/2"
                          >
                            <div className="p-1 bg-green-500/20 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </FormControl>
                    <AnimatePresence>
                      {fieldState.error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
          
          {/* Premium Submit Button */}
          <motion.div variants={itemVariants} className="pt-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button 
                type="submit" 
                className="w-full h-16 font-bold text-base bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white border-0 transition-all duration-500 rounded-2xl disabled:opacity-50 shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm relative overflow-hidden group"
                disabled={isLoading}
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-3 relative z-10"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-3 relative z-10"
                    >
                      <div className="p-1 bg-white/20 rounded-lg">
                        {isLogin ? <Shield className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <span>{isLogin ? "Sign In Securely" : "Create Account"}</span>
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
