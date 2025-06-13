
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ServiceModal } from "@/components/service-modal";
import { AuthModal } from "@/components/auth-modal";

interface Service {
  id: number;
  name: string;
  category: string;
  rate: string;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  active: boolean;
}

export default function RewardServices() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasDiscountAccess, setHasDiscountAccess] = useState(false);

  // Check if user has discount access
  useQuery({
    queryKey: ["/api/referrals/discount-access"],
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setHasDiscountAccess(data);
      if (!data) {
        toast({
          title: "Access Denied",
          description: "You need to complete 5 referrals to access discount services!",
          variant: "destructive",
        });
      }
    },
  });

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated && hasDiscountAccess,
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Failed to place order");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your discounted order has been placed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleServiceClick = (service: Service) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!hasDiscountAccess) {
      toast({
        title: "Access Required",
        description: "Complete 5 referrals to unlock 50% discount!",
        variant: "destructive",
      });
      return;
    }
    setSelectedService(service);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <i className="fas fa-lock text-gold text-6xl mb-6"></i>
            <h1 className="text-4xl font-bold text-gold mb-4">Login Required</h1>
            <p className="text-xl text-cream/70 mb-8">Please login to access exclusive discount services</p>
            <Button onClick={() => setIsAuthModalOpen(true)} className="btn-primary px-8 py-3 text-lg">
              Login Now
            </Button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  if (!hasDiscountAccess) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <i className="fas fa-gift text-gold text-6xl mb-6"></i>
            <h1 className="text-4xl font-bold text-gold mb-4">Discount Access Required</h1>
            <p className="text-xl text-cream/70 mb-8">You need to complete 5 referrals to unlock 50% discount on all services!</p>
            <Button onClick={() => window.location.href = "/referrals"} className="btn-primary px-8 py-3 text-lg">
              Complete Referrals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <i className="fas fa-spinner fa-spin text-gold text-6xl mb-6"></i>
            <h1 className="text-2xl font-bold text-gold">Loading Discount Services...</h1>
          </div>
        </div>
      </div>
    );
  }

  const serviceCategories = services?.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>) || {};

  return (
    <>
      <div className="pt-28 pb-16" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full px-6 py-2 mb-6">
              <i className="fas fa-crown text-yellow-400 mr-2"></i>
              <span className="text-green-400 font-semibold">Exclusive 50% Discount Services</span>
            </div>
            <h1 className="text-5xl font-bold text-gold mb-6">
              Premium Services at 
              <span className="text-green-400"> Half Price!</span>
            </h1>
            <p className="text-xl text-cream/80 max-w-3xl mx-auto mb-8">
              Congratulations! You've unlocked exclusive 50% discount on all our premium services. 
              Enjoy the same quality at unbeatable prices.
            </p>
            <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-yellow-400 font-medium">
                🎉 You're saving up to ₹500 on every order!
              </p>
            </div>
          </div>

          {/* Services Grid */}
          {Object.entries(serviceCategories).map(([category, categoryServices]) => (
            <div key={category} className="mb-12">
              <h2 className="text-3xl font-bold text-gold mb-8 text-center">{category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryServices.map((service) => {
                  const originalPrice = parseFloat(service.rate);
                  const discountedPrice = (originalPrice / 2).toFixed(2);
                  
                  return (
                    <div
                      key={service.id}
                      className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden"
                      onClick={() => handleServiceClick(service)}
                    >
                      {/* 50% OFF Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                        50% OFF!
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gold mb-2">{service.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-cream/50 line-through text-lg">₹{service.rate}</span>
                          <span className="text-green-400 font-bold text-2xl">₹{discountedPrice}</span>
                        </div>
                        <p className="text-cream/70 text-sm">Per 1000 {service.name.toLowerCase().includes('follower') ? 'followers' : service.name.toLowerCase().includes('like') ? 'likes' : service.name.toLowerCase().includes('view') ? 'views' : 'items'}</p>
                      </div>

                      <div className="space-y-2 text-sm text-cream/70">
                        <div className="flex justify-between">
                          <span>Min Order:</span>
                          <span className="text-cream">{service.minOrder.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Order:</span>
                          <span className="text-cream">{service.maxOrder.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery:</span>
                          <span className="text-cream">{service.deliveryTime}</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4 btn-primary">
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Order Now (50% OFF)
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedService && (
        <ServiceModal
          service={{
            ...selectedService,
            rate: (parseFloat(selectedService.rate) / 2).toFixed(2) // Apply 50% discount
          }}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onOrder={(orderData) => orderMutation.mutate(orderData)}
          isLoading={orderMutation.isPending}
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
