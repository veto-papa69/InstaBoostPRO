
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
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

export default function ServicesDiscount() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated,
  });

  // Check if user has discount access
  const { data: hasDiscountAccess } = useQuery<boolean>({
    queryKey: ["/api/referrals/discount-access"],
    enabled: isAuthenticated,
  });

  // Show auth modal immediately if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-lock text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Authentication Required</h1>
              <p className="text-xl text-cream/70 mb-8">Please login with your Instagram account to access discounted services</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  // Check if user has discount access
  if (hasDiscountAccess === false) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-times-circle text-red-400 text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Discount Not Available</h1>
              <p className="text-xl text-cream/70 mb-8">You need to complete the referral program to access 50% discount</p>
              <a href="/referrals" className="btn-primary px-8 py-3 text-lg">
                Go to Referral Program
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleOrderService = (service: Service) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login with your Instagram account first to place an order.",
        variant: "destructive",
      });
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "fas fa-users";
      case "likes":
        return "fas fa-heart";
      case "views":
        return "fas fa-eye";
      case "comments":
        return "fas fa-comments";
      default:
        return "fas fa-star";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "from-pink-500/20 to-purple-500/20";
      case "likes":
        return "from-red-500/20 to-pink-500/20";
      case "views":
        return "from-blue-500/20 to-cyan-500/20";
      case "comments":
        return "from-green-500/20 to-emerald-500/20";
      default:
        return "from-gold/20 to-tan/20";
    }
  };

  // Calculate discounted price (50% off)
  const getDiscountedPrice = (originalRate: string) => {
    return (parseFloat(originalRate) * 0.5).toFixed(2);
  };

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6 mb-8">
              <h1 className="text-4xl font-bold text-gold mb-4">
                <i className="fas fa-percentage mr-3"></i>
                50% Discount Services
              </h1>
              <p className="text-xl text-cream/70">
                Congratulations! You've unlocked 50% discount on all services
              </p>
            </div>
          </div>

          {/* Service Categories Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const minRate = Math.min(...categoryServices.map(s => parseFloat(s.rate)));
              const discountedMinRate = minRate * 0.5;
              return (
                <div key={category} className="bg-charcoal border border-green-400/40 rounded-xl p-6 text-center hover:border-green-400/60 transition-all duration-300 hover:transform hover:scale-105">
                  <i className={`${getCategoryIcon(category)} text-gold text-3xl mb-4`}></i>
                  <h3 className="text-lg font-bold text-gold mb-2">{category}</h3>
                  <p className="text-cream/80 text-sm mb-4">
                    {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''} available
                  </p>
                  <div className="space-y-1">
                    <span className="text-red-400 line-through text-sm block">
                      Was {formatCurrency(minRate)}/1000
                    </span>
                    <span className="text-green-400 font-bold text-lg block">
                      Now {formatCurrency(discountedMinRate)}/1000
                    </span>
                  </div>
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-2 inline-block">
                    50% OFF
                  </div>
                </div>
              );
            })}
          </div>

          {/* Services by Category */}
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="bg-charcoal border border-green-400/40 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-4 border-b border-green-400/30`}>
                  <h2 className="text-xl font-semibold text-gold flex items-center">
                    <i className={`${getCategoryIcon(category)} mr-3`}></i>
                    Instagram {category}
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-4">
                      50% OFF
                    </span>
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-charcoal-dark">
                      <tr className="text-left">
                        <th className="p-4 text-cream/70">Service</th>
                        <th className="p-4 text-cream/70">Rate</th>
                        <th className="p-4 text-cream/70">Min/Max</th>
                        <th className="p-4 text-cream/70">Delivery</th>
                        <th className="p-4 text-cream/70">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryServices.map((service) => {
                        const originalRate = parseFloat(service.rate);
                        const discountedRate = originalRate * 0.5;
                        return (
                          <tr key={service.id} className="border-t border-green-400/20 hover:bg-charcoal-dark/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <span className="font-medium text-cream">{service.name}</span>
                                <p className="text-sm text-cream/60">High quality {category.toLowerCase()}</p>
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                  50% OFF
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="text-red-400 line-through text-sm">
                                  {formatCurrency(originalRate)} per 1000
                                </div>
                                <div className="text-green-400 font-semibold text-lg">
                                  {formatCurrency(discountedRate)} per 1000
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-cream/70">
                              {service.minOrder.toLocaleString()} / {service.maxOrder.toLocaleString()}
                            </td>
                            <td className="p-4 text-cream/70">{service.deliveryTime}</td>
                            <td className="p-4">
                              <Button
                                onClick={() => handleOrderService({
                                  ...service,
                                  rate: discountedRate.toString()
                                })}
                                className="bg-green-500 hover:bg-green-600 text-white hover:scale-105 transition-all duration-300"
                                size="sm"
                              >
                                <i className="fas fa-shopping-cart mr-2"></i>Order
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-4xl text-cream/50 mb-4"></i>
              <h3 className="text-xl font-semibold text-cream mb-2">No Services Available</h3>
              <p className="text-cream/70">Services will be available soon. Please check back later.</p>
            </div>
          )}
        </div>
      </div>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={selectedService}
        isDiscounted={true}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
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

export default function ServicesDiscount() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasDiscountAccess, setHasDiscountAccess] = useState(false);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated,
  });

  // Check discount access
  useQuery({
    queryKey: ["/api/referrals/discount-access"],
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setHasDiscountAccess(data);
    },
  });

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-lock text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Authentication Required</h1>
              <p className="text-xl text-cream/70 mb-8">Please login to access discount services</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  // Show access denied if user doesn't have discount access
  if (!hasDiscountAccess) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-users text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Discount Access Required</h1>
              <p className="text-xl text-cream/70 mb-8">You need to refer 5 friends to access discount services</p>
              <a href="/referrals" className="btn-primary px-8 py-3 text-lg inline-block">
                Start Referring Friends
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleOrderService = (service: Service) => {
    // Apply 50% discount to the service
    const discountedService = {
      ...service,
      rate: (parseFloat(service.rate) * 0.5).toString()
    };
    setSelectedService(discountedService);
    setIsServiceModalOpen(true);
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "fas fa-users";
      case "likes":
        return "fas fa-heart";
      case "views":
        return "fas fa-eye";
      case "comments":
        return "fas fa-comments";
      default:
        return "fas fa-star";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "followers":
        return "from-pink-500/20 to-purple-500/20";
      case "likes":
        return "from-red-500/20 to-pink-500/20";
      case "views":
        return "from-blue-500/20 to-cyan-500/20";
      case "comments":
        return "from-green-500/20 to-emerald-500/20";
      default:
        return "from-gold/20 to-tan/20";
    }
  };

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Celebration Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="flex space-x-2">
                <i className="fas fa-star text-yellow-400 text-2xl animate-pulse"></i>
                <i className="fas fa-gift text-pink-400 text-2xl animate-bounce"></i>
                <i className="fas fa-star text-yellow-400 text-2xl animate-pulse"></i>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-8 mb-8">
              <h1 className="text-5xl font-bold text-green-400 mb-4">🎉 Congratulations! 🎉</h1>
              <p className="text-2xl text-cream mb-4">You've unlocked 50% discount on ALL services!</p>
              <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full text-lg font-bold">
                <i className="fas fa-trophy mr-2"></i>
                Referral Master Status Achieved
              </div>
            </div>
          </div>

          {/* Service Categories Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(groupedServices).map(([category, categoryServices]) => {
              const minRate = Math.min(...categoryServices.map(s => parseFloat(s.rate)));
              const discountedRate = minRate * 0.5;
              return (
                <div key={category} className="bg-charcoal border border-gold/20 rounded-xl p-6 text-center hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105 relative">
                  {/* 50% OFF Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    50% OFF
                  </div>
                  <i className={`${getCategoryIcon(category)} text-gold text-3xl mb-4`}></i>
                  <h3 className="text-lg font-bold text-gold mb-2">{category}</h3>
                  <p className="text-cream/80 text-sm mb-4">
                    {categoryServices.length} service{categoryServices.length > 1 ? 's' : ''} available
                  </p>
                  <div className="space-y-1">
                    <span className="text-cream/60 line-through text-sm block">
                      Was {formatCurrency(minRate)}/1000
                    </span>
                    <span className="text-green-400 font-bold text-lg">
                      Now {formatCurrency(discountedRate)}/1000
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Services by Category */}
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category} className="bg-charcoal border border-gold/20 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-4 border-b border-gold/20`}>
                  <h2 className="text-xl font-semibold text-gold flex items-center">
                    <i className={`${getCategoryIcon(category)} mr-3`}></i>
                    Instagram {category}
                    <span className="ml-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      50% OFF
                    </span>
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-charcoal-dark">
                      <tr className="text-left">
                        <th className="p-4 text-cream/70">Service</th>
                        <th className="p-4 text-cream/70">Original Price</th>
                        <th className="p-4 text-cream/70">Discount Price</th>
                        <th className="p-4 text-cream/70">Min/Max</th>
                        <th className="p-4 text-cream/70">Delivery</th>
                        <th className="p-4 text-cream/70">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryServices.map((service) => {
                        const originalPrice = parseFloat(service.rate);
                        const discountPrice = originalPrice * 0.5;
                        return (
                          <tr key={service.id} className="border-t border-gold/10 hover:bg-charcoal-dark/50 transition-colors">
                            <td className="p-4">
                              <div className="relative">
                                <span className="font-medium text-cream">{service.name}</span>
                                <p className="text-sm text-cream/60">High quality {category.toLowerCase()}</p>
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  50% OFF
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-cream/60 line-through">
                                {formatCurrency(originalPrice)} per 1000
                              </span>
                            </td>
                            <td className="p-4 text-green-400 font-bold text-lg">
                              {formatCurrency(discountPrice)} per 1000
                            </td>
                            <td className="p-4 text-cream/70">
                              {service.minOrder.toLocaleString()} / {service.maxOrder.toLocaleString()}
                            </td>
                            <td className="p-4 text-cream/70">{service.deliveryTime}</td>
                            <td className="p-4">
                              <Button
                                onClick={() => handleOrderService(service)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold hover:scale-105 transition-all duration-300"
                                size="sm"
                              >
                                <i className="fas fa-shopping-bag mr-2"></i>Order Now
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-4xl text-cream/50 mb-4"></i>
              <h3 className="text-xl font-semibold text-cream mb-2">No Services Available</h3>
              <p className="text-cream/70">Services will be available soon. Please check back later.</p>
            </div>
          )}
        </div>
      </div>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={selectedService}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
