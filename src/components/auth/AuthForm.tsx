
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
import { Eye, EyeOff, KeyRound, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
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

  const inputVariants = {
    focus: { scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } },
    blur: { scale: 1 }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-4">
          {/* Email Field */}
          <PerformantFadeIn delay={0.1}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Email</FormLabel>
                  <FormControl>
                    <motion.div 
                      variants={inputVariants}
                      whileFocus="focus"
                      className="relative group"
                    >
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input 
                        placeholder="Enter your email" 
                        className="pl-10 h-12 bg-card/60 border-border/60 focus:border-primary/80 focus:bg-card/80 transition-all duration-300 hover:border-primary/40" 
                        {...field}
                        disabled={isLoading} 
                        autoComplete="email"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </PerformantFadeIn>

          {/* Username Field (Signup only) */}
          {!isLogin && (
            <PerformantFadeIn delay={0.2}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Username</FormLabel>
                    <FormControl>
                      <motion.div 
                        variants={inputVariants}
                        whileFocus="focus"
                        className="relative group"
                      >
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        <Input 
                          placeholder="Choose a username" 
                          className="pl-10 h-12 bg-card/60 border-border/60 focus:border-primary/80 focus:bg-card/80 transition-all duration-300 hover:border-primary/40" 
                          {...field}
                          disabled={isLoading} 
                          autoComplete="username"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </PerformantFadeIn>
          )}

          {/* Password Field */}
          <PerformantFadeIn delay={isLogin ? 0.2 : 0.3}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80 font-medium">Password</FormLabel>
                  <FormControl>
                    <motion.div 
                      variants={inputVariants}
                      whileFocus="focus"
                      className="relative group"
                    >
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder={isLogin ? "Enter your password" : "Create a password"} 
                        className="pl-10 pr-12 h-12 bg-card/60 border-border/60 focus:border-primary/80 focus:bg-card/80 transition-all duration-300 hover:border-primary/40"
                        {...field}
                        disabled={isLoading} 
                        autoComplete={isLogin ? "current-password" : "new-password"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-1 top-1 h-10 w-10 p-0 text-muted-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </PerformantFadeIn>

          {/* Confirm Password Field (Signup only) */}
          {!isLogin && (
            <PerformantFadeIn delay={0.4}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <motion.div 
                        variants={inputVariants}
                        whileFocus="focus"
                        className="relative group"
                      >
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm your password" 
                          className="pl-10 pr-12 h-12 bg-card/60 border-border/60 focus:border-primary/80 focus:bg-card/80 transition-all duration-300 hover:border-primary/40"
                          {...field}
                          disabled={isLoading} 
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-1 top-1 h-10 w-10 p-0 text-muted-foreground hover:text-primary transition-colors duration-200"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </motion.div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </PerformantFadeIn>
          )}
        </div>
        
        <PerformantFadeIn delay={isLogin ? 0.3 : 0.5}>
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin"></div>
                {isLogin ? "Signing in..." : "Creating account..."}
              </motion.div>
            ) : (
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </motion.span>
            )}
          </Button>
        </PerformantFadeIn>
      </form>
    </Form>
  );
});

AuthForm.displayName = "AuthForm";

export default AuthForm;
