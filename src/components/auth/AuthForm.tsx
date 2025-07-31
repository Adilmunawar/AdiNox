
import React, { useState } from "react";
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
import { Eye, EyeOff, KeyRound, Mail, User, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PerformantFadeIn } from "@/components/ui/performance-animations";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  username: z.string().min(3, "Username must be at least 3 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  password: z.string().min(6, "Password must be at least 6 characters."),
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
  });

  const handleSubmit = React.useCallback(async (data: any) => {
    await onSubmit(data);
  }, [onSubmit]);

  const FormFieldComponent = ({ name, label, placeholder, icon: Icon, type: inputType = "text", showToggle = false }: {
    name: string;
    label: string;
    placeholder: string;
    icon: any;
    type?: string;
    showToggle?: boolean;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </FormLabel>
          <FormControl>
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className={`
                absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10
                ${focusedField === name ? 'opacity-100' : ''}
              `} />
              
              <Input 
                placeholder={placeholder}
                className={`
                  h-12 px-4 bg-card/60 border border-border/50 rounded-lg
                  focus:border-primary/60 focus:bg-card/80 focus:ring-2 focus:ring-primary/20
                  transition-all duration-300 font-medium
                  hover:border-primary/40 hover:bg-card/70
                  ${fieldState.error ? 'border-destructive/50 focus:border-destructive/60' : ''}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: (name === 'password' ? showPassword : showConfirmPassword) ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(name === 'password' ? showPassword : showConfirmPassword) ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </motion.div>
                </Button>
              )}
              
              {/* Success indicator */}
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
              </AnimatePresence>
            </motion.div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
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
              placeholder={isLogin ? "Enter your password" : "Create a password"} 
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
              w-full h-12 bg-gradient-to-r from-primary via-primary/90 to-primary/80 
              hover:from-primary/90 hover:via-primary/80 hover:to-primary/70
              text-primary-foreground font-semibold text-base
              shadow-lg hover:shadow-xl hover:shadow-primary/25
              transition-all duration-300 transform hover:-translate-y-0.5
              disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg
              border border-primary/20 hover:border-primary/30
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
