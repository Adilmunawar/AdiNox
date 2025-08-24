
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
import { Eye, EyeOff, Mail, User, Loader2, AlertCircle, Shield } from "lucide-react";

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
      { label: "Very Weak", color: "text-red-600" },
      { label: "Weak", color: "text-orange-600" },
      { label: "Fair", color: "text-yellow-600" },
      { label: "Good", color: "text-blue-600" },
      { label: "Strong", color: "text-green-600" },
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your email address"
                      className={`h-11 bg-white border-2 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors ${
                        fieldState.error 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-slate-300 focus:border-slate-900'
                      }`}
                      type="email"
                      {...field}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="text-red-600 flex items-center gap-2 text-sm bg-red-50 p-2 rounded-md border border-red-200">
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
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Choose your username"
                        className={`h-11 bg-white border-2 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors ${
                          fieldState.error 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-slate-300 focus:border-slate-900'
                        }`}
                        {...field}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-red-600 flex items-center gap-2 text-sm bg-red-50 p-2 rounded-md border border-red-200">
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
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                        className={`h-11 pr-12 bg-white border-2 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors ${
                          fieldState.error 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-slate-300 focus:border-slate-900'
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 text-slate-500"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  
                  {/* Password Strength Indicator */}
                  {passwordStrength && field.value && (
                    <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">
                          Password Strength
                        </span>
                        <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-300"
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {fieldState.error && (
                    <FormMessage className="text-red-600 flex items-center gap-2 text-sm bg-red-50 p-2 rounded-md border border-red-200">
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
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Confirm your password"
                        className={`h-11 pr-12 bg-white border-2 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors ${
                          fieldState.error 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-slate-300 focus:border-slate-900'
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 text-slate-500"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage className="text-red-600 flex items-center gap-2 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          )}
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 font-semibold text-base bg-slate-900 hover:bg-slate-800 text-white border-0 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
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
