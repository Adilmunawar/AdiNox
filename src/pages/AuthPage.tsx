
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthTabs from "@/components/auth/AuthTabs";
import AuthForm from "@/components/auth/AuthForm";
import { PageHeader } from "@/components/ui/page-header";

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

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = useCallback(async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
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
          title: "Welcome back!",
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
  }, [navigate, toast]);

  const handleSignup = useCallback(async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
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
          title: "Account created successfully!",
          description: "You can now sign in with your credentials.",
        });
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
  }, [toast]);

  return (
    <>
      <PageHeader showAuth={false} />
      <AuthContainer>
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab}>
          <TabsContent value="login" className="mt-0">
            <AuthForm 
              type="login" 
              onSubmit={handleLogin} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <AuthForm 
              type="signup" 
              onSubmit={handleSignup} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </AuthTabs>
      </AuthContainer>
    </>
  );
};

export default AuthPage;
