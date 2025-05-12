
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, KeyRound, Mail, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Signup form schema
const signupSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Animation variants for motion elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100 
    } 
  }
};

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Sign in directly with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: "Authentication error",
          description: error.message || "Failed to login. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Sign up with email and password, no email verification
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
          // Skip email verification
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        toast({
          title: "Signup error",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully! You can now login.",
        });
        loginForm.setValue("email", data.email);
        setActiveTab("login");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md mx-auto"
      >
        <Card className="w-full shadow-xl bg-card/80 backdrop-blur-md border-white/10 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          
          <motion.div 
            variants={itemVariants} 
            className="flex justify-center mt-6 relative z-10"
          >
            <img 
              src="/lovable-uploads/1e18899e-2160-4944-9175-794607679d04.png" 
              alt="AdiNox Logo" 
              className="h-20 w-20 animate-pulse-subtle"
            />
          </motion.div>
          
          <CardHeader className="space-y-1 text-center relative z-10">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
                AdiNox Authenticator
              </CardTitle>
              <CardDescription className="text-foreground/70">
                Sign in to your account or create a new one
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <motion.div variants={itemVariants}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="login" 
                    className={activeTab === "login" ? "bg-primary/20 text-primary" : ""}
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className={activeTab === "signup" ? "bg-primary/20 text-primary" : ""}
                  >
                    Sign up
                  </TabsTrigger>
                </TabsList>
              </motion.div>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <motion.div 
                      variants={itemVariants}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your email" 
                                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300" 
                                  {...field}
                                  disabled={isLoading} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type={showLoginPassword ? "text" : "password"} 
                                  placeholder="Enter your password" 
                                  className="pl-10 pr-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300"
                                  {...field}
                                  disabled={isLoading} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="absolute right-0 top-0 h-10 w-10 p-0 text-muted-foreground hover:text-primary"
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                  {showLoginPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                  <span className="sr-only">
                                    {showLoginPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 mr-2 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin"></div>
                            Logging in...
                          </>
                        ) : "Login"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Sign up Form */}
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <motion.div 
                      variants={itemVariants}
                      className="space-y-4"
                    >
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your email" 
                                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300" 
                                  {...field}
                                  disabled={isLoading} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300" 
                                  {...field}
                                  disabled={isLoading} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type={showSignupPassword ? "text" : "password"} 
                                  placeholder="Create a password" 
                                  className="pl-10 pr-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300"
                                  {...field}
                                  disabled={isLoading} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="absolute right-0 top-0 h-10 w-10 p-0 text-muted-foreground hover:text-primary"
                                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                                >
                                  {showSignupPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                  <span className="sr-only">
                                    {showSignupPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/70">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder="Confirm your password" 
                                  className="pl-10 pr-10 bg-card/50 border-border/50 focus:border-primary/70 transition-all duration-300"
                                  {...field}
                                  disabled={isLoading} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="absolute right-0 top-0 h-10 w-10 p-0 text-muted-foreground hover:text-primary"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                  <span className="sr-only">
                                    {showConfirmPassword ? "Hide password" : "Show password"}
                                  </span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 mr-2 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin"></div>
                            Creating account...
                          </>
                        ) : "Create Account"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="text-center pb-6 relative z-10">
            <motion.div 
              variants={itemVariants}
              className="w-full"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground/70">
                  Proudly Developed by Adil Munawar
                </p>
              </div>
              
              <div className="mt-2 flex justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-ping delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-ping delay-200"></div>
              </div>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;
