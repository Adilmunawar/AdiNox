
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
import { Eye, EyeOff, KeyRound, Mail, User, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PerformantFadeIn } from "@/components/ui/performance-animations";
import { useTheme } from "@/context/ThemeContext";

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
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type FormFieldName = "email" | "password" | "username" | "confirmPassword";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: LoginFormValues | SignupFormValues) => Promise<void>;
  isLoading: boolean;
}

const AuthForm = React.memo(({ type, onSubmit, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { theme } = useTheme();

  const isLogin = type === "login";
  const schema = isLogin ? loginSchema : signupSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isLogin 
      ? { email: "", password: "" }
      : { email: "", username: "", password: "", confirmPassword: "" },
  });

  const handleSubmit = useCallback(async (data: any) => {
    await onSubmit(data);
  }, [onSubmit]);

  // Password strength indicator
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

  const FormFieldComponent = ({ name, label, placeholder, icon: Icon, type: inputType = "text", showToggle = false }: {
    name: FormFieldName;
    label: string;
    placeholder: string;
    icon: any;
    type?: string;
    showToggle?: boolean;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const passwordStrength = name === 'password' && !isLogin ? getPasswordStrength(field.value) : null;
        
        return (
          <FormItem>
            <FormLabel className="text-foreground font-semibold text-sm flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </FormLabel>
            <FormControl>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className={`
                  absolute inset-0 rounded-lg opacity-0 transition-all duration-300 blur-sm -z-10
                  ${focusedField === name ? 'opacity-100' : 'group-hover:opacity-100'}
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-primary/25 to-secondary/25'
                    : 'bg-gradient-to-r from-primary/15 to-secondary/15'
                  }
                `} />
                
                <Input 
                  placeholder={placeholder}
                  className={`
                    h-12 px-4 rounded-lg transition-all duration-300 font-medium
                    ${theme === 'dark'
                      ? 'bg-card/70 border border-border/60 focus:border-primary/70 focus:bg-card/90 focus:ring-2 focus:ring-primary/25 hover:border-primary/50 hover:bg-card/80'
                      : 'bg-card/80 border border-border/50 focus:border-primary/60 focus:bg-card/95 focus:ring-2 focus:ring-primary/15 hover:border-primary/40 hover:bg-card/90'
                    }
                    ${fieldState.error ? 'border-destructive/60 focus:border-destructive/70' : ''}
                    ${showToggle ? 'pr-12' : ''}
                  `}
                  type={showToggle ? (name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : inputType}
                  {...field}
                  disabled={isLoading}
                  autoComplete={name === 'email' ? 'email' : name === 'username' ? 'username' : name.includes('password') ? 'current-password' : 'off'}
                  onFocus={() => setFocusedField(name)}
                  onBlur={() => setFocusedField(null)}
                />
                
                {showToggle && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 transition-colors
                      ${theme === 'dark'
                        ? 'text-muted-foreground hover:text-primary'
                        : 'text-muted-foreground hover:text-primary'
                      }
                    `}
                    onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: (name === 'password' ? showPassword : showConfirmPassword) ? 0 : 180 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {(name === 'password' ? showPassword : showConfirmPassword) ? 
                        <EyeOff className="h-4 w-4" /> : 
                        <Eye className="h-4 w-4" />
                      }
                    </motion.div>
                  </Button>
                )}
                
                {/* Success/Error indicators */}
                <AnimatePresence>
                  {field.value && !fieldState.error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                  {fieldState.error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Password strength indicator */}
                {passwordStrength && field.value && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
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
              </motion.div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* Email Field */}
          <PerformantFadeIn delay={0.1}>
            <FormFieldComponent 
              name="email" 
              label="Email Address" 
              placeholder="Enter your email" 
              icon={Mail} 
              type="email" 
            />
          </PerformantFadeIn>

          {/* Username Field (Signup only) */}
          {!isLogin && (
            <PerformantFadeIn delay={0.2}>
              <FormFieldComponent 
                name="username" 
                label="Username" 
                placeholder="Choose a username" 
                icon={User} 
              />
            </PerformantFadeIn>
          )}

          {/* Password Field */}
          <PerformantFadeIn delay={isLogin ? 0.2 : 0.3}>
            <FormFieldComponent 
              name="password" 
              label="Password" 
              placeholder={isLogin ? "Enter your password" : "Create a strong password"} 
              icon={KeyRound} 
              showToggle={true}
            />
          </PerformantFadeIn>

          {/* Confirm Password Field (Signup only) */}
          {!isLogin && (
            <PerformantFadeIn delay={0.4}>
              <FormFieldComponent 
                name="confirmPassword" 
                label="Confirm Password" 
                placeholder="Confirm your password" 
                icon={KeyRound} 
                showToggle={true}
              />
            </PerformantFadeIn>
          )}
        </div>
        
        <PerformantFadeIn delay={isLogin ? 0.3 : 0.5}>
          <Button 
            type="submit" 
            className={`
              w-full h-12 font-semibold text-base shadow-lg transition-all duration-300
              transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 
              disabled:hover:shadow-lg border hover:shadow-xl
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary/85 hover:to-primary/80 text-primary-foreground hover:shadow-primary/25 border-primary/25 hover:border-primary/35'
                : 'bg-gradient-to-r from-primary via-primary/90 to-primary/85 hover:from-primary/90 hover:via-primary/80 hover:to-primary/75 text-primary-foreground hover:shadow-primary/20 border-primary/20 hover:border-primary/30'
              }
            `}
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
                <motion.div
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-2"
                >
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </PerformantFadeIn>
      </form>
    </Form>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
