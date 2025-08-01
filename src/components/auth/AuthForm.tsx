
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
import { Eye, EyeOff, KeyRound, Mail, User, Loader2 } from "lucide-react";
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
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"];
    
    return {
      strength: Math.min(strength, 5),
      label: labels[Math.min(strength - 1, 4)] || "",
      color: colors[Math.min(strength - 1, 4)] || ""
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Enter your email"
                    className={`h-11 transition-all duration-200 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldState.error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
                    }`}
                    type="email"
                    {...field}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Username Field (Signup only) */}
        {!isLogin && (
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Username
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Choose a username"
                    className={`h-11 transition-all duration-200 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldState.error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
                    }`}
                    {...field}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => {
            const passwordStrength = !isLogin ? getPasswordStrength(field.value) : null;
            
            return (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      className={`h-11 pr-10 transition-all duration-200 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                        fieldState.error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
                      }`}
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
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
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.strength === 1 ? 'bg-red-500' :
                            passwordStrength.strength === 2 ? 'bg-orange-500' :
                            passwordStrength.strength === 3 ? 'bg-yellow-500' :
                            passwordStrength.strength === 4 ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
        />

        {/* Confirm Password Field (Signup only) */}
        {!isLogin && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Confirm your password"
                      className={`h-11 pr-10 transition-all duration-200 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                        fieldState.error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
                      }`}
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...field}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 mt-6"
          disabled={isLoading}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
              </motion.div>
            ) : (
              <motion.span
                key="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>
    </Form>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
