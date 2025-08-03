
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
import { Eye, EyeOff, KeyRound, Mail, User, Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
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
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
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
                  <FormLabel className="text-white/90 font-semibold flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{
                        scale: focusedField === 'email' ? 1.2 : 1,
                        color: focusedField === 'email' ? '#a855f7' : '#ffffff'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="h-5 w-5" />
                    </motion.div>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="Enter your email address"
                        className={`h-14 pl-4 pr-4 bg-white/5 backdrop-blur-xl border-2 rounded-2xl text-white placeholder:text-white/50 font-medium transition-all duration-300 focus:scale-[1.02] ${
                          fieldState.error 
                            ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-400/20' 
                            : focusedField === 'email'
                              ? 'border-purple-400/50 focus:border-purple-400 shadow-lg shadow-purple-400/20'
                              : 'border-white/20 hover:border-white/30'
                        }`}
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
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </motion.div>
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
                        <FormMessage className="text-red-400 flex items-center gap-2 mt-2">
                          <AlertCircle className="h-4 w-4" />
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
                    <FormLabel className="text-white/90 font-semibold flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{
                          scale: focusedField === 'username' ? 1.2 : 1,
                          color: focusedField === 'username' ? '#a855f7' : '#ffffff'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <User className="h-5 w-5" />
                      </motion.div>
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Choose your username"
                          className={`h-14 pl-4 pr-4 bg-white/5 backdrop-blur-xl border-2 rounded-2xl text-white placeholder:text-white/50 font-medium transition-all duration-300 focus:scale-[1.02] ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-400/20' 
                              : focusedField === 'username'
                                ? 'border-purple-400/50 focus:border-purple-400 shadow-lg shadow-purple-400/20'
                                : 'border-white/20 hover:border-white/30'
                          }`}
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
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </motion.div>
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
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2">
                            <AlertCircle className="h-4 w-4" />
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
                    <FormLabel className="text-white/90 font-semibold flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{
                          scale: focusedField === 'password' ? 1.2 : 1,
                          color: focusedField === 'password' ? '#a855f7' : '#ffffff'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <KeyRound className="h-5 w-5" />
                      </motion.div>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                          className={`h-14 pl-4 pr-14 bg-white/5 backdrop-blur-xl border-2 rounded-2xl text-white placeholder:text-white/50 font-medium transition-all duration-300 focus:scale-[1.02] ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-400/20' 
                              : focusedField === 'password'
                                ? 'border-purple-400/50 focus:border-purple-400 shadow-lg shadow-purple-400/20'
                                : 'border-white/20 hover:border-white/30'
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 text-white/60 hover:text-white transition-colors rounded-lg"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <motion.div
                            animate={{ rotate: showPassword ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </motion.div>
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && field.value && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">Password Strength</span>
                          <span className={`text-sm font-bold ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                          <motion.div
                            className={`h-full ${passwordStrength.bgColor} rounded-full relative overflow-hidden`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: [-100, 100] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
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
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2">
                            <AlertCircle className="h-4 w-4" />
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
                    <FormLabel className="text-white/90 font-semibold flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{
                          scale: focusedField === 'confirmPassword' ? 1.2 : 1,
                          color: focusedField === 'confirmPassword' ? '#a855f7' : '#ffffff'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <KeyRound className="h-5 w-5" />
                      </motion.div>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Confirm your password"
                          className={`h-14 pl-4 pr-14 bg-white/5 backdrop-blur-xl border-2 rounded-2xl text-white placeholder:text-white/50 font-medium transition-all duration-300 focus:scale-[1.02] ${
                            fieldState.error 
                              ? 'border-red-400/50 focus:border-red-400 shadow-lg shadow-red-400/20' 
                              : focusedField === 'confirmPassword'
                                ? 'border-purple-400/50 focus:border-purple-400 shadow-lg shadow-purple-400/20'
                                : 'border-white/20 hover:border-white/30'
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 text-white/60 hover:text-white transition-colors rounded-lg"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          <motion.div
                            animate={{ rotate: showConfirmPassword ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </motion.div>
                        </Button>
                        {!fieldState.error && field.value && form.watch('password') === field.value && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute right-12 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </motion.div>
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
                          <FormMessage className="text-red-400 flex items-center gap-2 mt-2">
                            <AlertCircle className="h-4 w-4" />
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
          <motion.div variants={itemVariants} className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-16 font-bold text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 rounded-2xl border-0 relative overflow-hidden group"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button Background Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{isLogin ? "Signing you in..." : "Creating your account..."}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="submit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-3 relative z-10"
                  >
                    <Zap className="h-6 w-6" />
                    <span>{isLogin ? "Sign In Now" : "Create Account"}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
