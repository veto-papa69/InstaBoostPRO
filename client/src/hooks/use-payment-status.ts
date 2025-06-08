import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useAuth } from "./use-auth";
import { useEffect } from "react";

interface Payment {
  id: number;
  userId: number;
  amount: string;
  utrNumber: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

// Track processed payments globally to avoid re-notifications
const processedPayments = new Set<string>();

export function usePaymentStatus() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
    refetchInterval: 2000, // Check every 2 seconds for faster updates
  });

  useEffect(() => {
    payments.forEach(payment => {
      const paymentKey = `${payment.id}-${payment.status}`;
      
      if (processedPayments.has(paymentKey)) return;
      
      if (payment.status === "Approved") {
        toast({
          title: "Payment Approved!",
          description: `₹${payment.amount} has been added to your wallet successfully.`,
        });
        // Refresh user data to update wallet balance
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        processedPayments.add(paymentKey);
      } else if (payment.status === "Declined") {
        toast({
          title: "Payment Failed",
          description: "Your payment transaction has been declined. Please try again or contact support.",
          variant: "destructive",
        });
        processedPayments.add(paymentKey);
      }
    });
  }, [payments, toast, queryClient]);

  return { payments };
}