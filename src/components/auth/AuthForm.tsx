
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
import { Eye, EyeOff, Mail, User, Loader2, AlertCircle, Shield, Lock } from "lucide-react";

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
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    const configs = [
      { label: "Very Weak", color: "text-red-400" },
      { label: "Weak", color: "text-orange-400" },
      { label: "Fair", color: "text-yellow-400" },
      { label: "Good", color: "text-blue-400" },
      { label: "Strong", color: "text-green-400" },
    ];
    
    const config = configs[Math.min(strength - 1, 4)] || configs[0];
    
    return {
      strength: Math.min(strength, 5),
      ...config
    };
  }, []);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-foreground font-semibold flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input 
                      placeholder="Enter your email address"
                      className={`h-12 bg-secondary/50 backdrop-blur-sm border-2 rounded-xl placeholder:text-muted-foreground transition-all duration-300 ${
                        fieldState.error 
                          ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' 
                          : 'border-border focus:border-primary focus:ring-primary/20 group-hover:border-border/70'
                      } focus:ring-2 focus:ring-offset-0`}
                      type="email"
                      {...field}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="text-destructive flex items-center gap-2 text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {fieldState.error.message}
                  </FormMessage>
                )}
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
                  <FormLabel className="text-foreground font-semibold flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="Choose your username"
                        className={`h-12 bg-secondary/50 backdrop-blur-sm border-2 rounded-xl placeholder:text-muted-foreground transition-all duration-300 ${
                          fieldState.error 
                            ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' 
                            : 'border-border focus:border-primary focus:ring-primary/20 group-hover:border-border/70'
                        } focus:ring-2 focus:ring-offset-0`}
                        {...field}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-destructive flex items-center gap-2 text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
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
                  <FormLabel className="text-foreground font-semibold flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                        className={`h-12 pr-12 bg-secondary/50 backdrop-blur-sm border-2 rounded-xl placeholder:text-muted-foreground transition-all duration-300 ${
                          fieldState.error 
                            ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' 
                            : 'border-border focus:border-primary focus:ring-primary/20 group-hover:border-border/70'
                        } focus:ring-2 focus:ring-offset-0`}
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </FormControl>
                  
                  {/* Enhanced Password Strength Indicator */}
                  {passwordStrength && field.value && (
                    <div className="mt-3 space-y-3 p-4 bg-secondary/30 backdrop-blur-sm rounded-xl border border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground font-medium">
                          Password Strength
                        </span>
                        <span className={`text-xs font-bold ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {fieldState.error && (
                    <FormMessage className="text-destructive flex items-center gap-2 text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
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
                  <FormLabel className="text-foreground font-semibold flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="Confirm your password"
                        className={`h-12 pr-12 bg-secondary/50 backdrop-blur-sm border-2 rounded-xl placeholder:text-muted-foreground transition-all duration-300 ${
                          fieldState.error 
                            ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' 
                            : 'border-border focus:border-primary focus:ring-primary/20 group-hover:border-border/70'
                        } focus:ring-2 focus:ring-offset-0`}
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...field}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-destructive flex items-center gap-2 text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          )}
          
          {/* Enhanced Submit Button */}
          <div className="pt-6">
            <Button 
              type="submit" 
              className="w-full h-14 font-bold text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground border-0 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 relative z-10">
                  <Shield className="h-5 w-5" />
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
