import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const claimBonus = useClaimBonus();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFromBonus, setIsFromBonus] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Store in sessionStorage for login process
      sessionStorage.setItem('referralCode', refCode);
      // Show message about referral
      toast({
        title: "Referral Link Detected!",
        description: "Sign up now to help your friend get their discount reward!",
      });
    }
  }, [toast]);

  const handleDiscountReferral = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login with your Instagram account first to access the referral program.",
        variant: "destructive",
      });
      setIsAuthModalOpen(true);
      return;
    }
    setLocation("/referrals");
  };

  const handleClaimBonus = async () => {
    if (!isAuthenticated) {
      setIsFromBonus(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (user?.bonusClaimed) {
      toast({
        title: "Bonus Already Claimed",
        description: "You have already claimed your welcome bonus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await claimBonus.mutateAsync();
      toast({
        title: "Bonus Claimed!",
        description: "₹10 has been added to your wallet!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setLocation("/services");
    }
  };

  const handleDiscountReferral = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login with your Instagram account to access referral discounts.",
        variant: "destructive",
      });
      setIsAuthModalOpen(true);
    } else {
      setLocation("/referrals");
    }
  };

  return (
    <>
      {/* Sticky Announcement Banner */}
      <div className="fixed top-20 left-0 right-0 z-40 announcement-banner">
        <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-700/20 border-b border-red-400/30 shadow-lg announcement-glow">
          <div className="flex whitespace-nowrap animate-marquee py-3">
            <span className="text-sm font-bold text-red-100">
              🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉
            </span>
            <span className="text-sm font-bold text-red-100 ml-4">
              🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉
            </span>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-16">
        {/* Hero Section */}
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto">

            <div 
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-dark border border-gold/20 mb-16"
              style={{
                background: `linear-gradient(135deg, rgba(18, 38, 32, 0.95), rgba(28, 45, 36, 0.95)), linear-gradient(45deg, rgba(214, 173, 96, 0.1), rgba(214, 173, 96, 0.05))`,
              }}
            >
              <div className="px-8 py-16 md:px-16 md:py-24 text-center">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="https://files.catbox.moe/95hr3x.png" 
                    alt="InstaBoost Pro Logo" 
                    className="w-32 h-32 object-contain"
                  />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gold mb-6 leading-tight">
                  Boost Your Social Media<br />
                  <span className="text-cream">Instantly</span>
                </h1>

                <p className="text-xl md:text-2xl text-cream/80 mb-8 max-w-3xl mx-auto">
                  Get premium followers, likes, views, and comments at competitive prices starting from ₹11/1000
                </p>

                {/* Welcome Bonus Card */}
                <div className="inline-block bg-charcoal/90 backdrop-blur-sm border border-gold/30 rounded-2xl p-8 mb-8 shadow-2xl bonus-card">
                  <div className="text-center">
                    <div className="bonus-icon mb-4">
                      <i className="fas fa-gift text-gold text-5xl heartbeat"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gold mb-2">Welcome Bonus</h3>
                    <p className="text-cream/80 mb-4 text-lg">Claim your free followers now!</p>
                    <Button 
                      onClick={handleClaimBonus}
                      disabled={claimBonus.isPending || (isAuthenticated && user?.bonusClaimed)}
                      className="btn-primary pulse-glow heartbeat"
                    >
                      {claimBonus.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-star mr-2"></i>
                      )}
                      {isAuthenticated && user?.bonusClaimed ? "Bonus Claimed" : "Claim Now"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button 
                    onClick={handleGetStarted}
                    className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-rocket mr-2"></i>Get Started Free
                  </Button>
                  <Link href="/services">
                    <Button 
                      variant="outline" 
                      className="btn-outline text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
                    >
                      <i className="fas fa-eye mr-2"></i>View Services
                    </Button>
                  </Link>
                </div>

                {/* Discount Referral Button */}
                <div className="flex justify-center mb-12">
                  <Button 
                    onClick={handleDiscountReferral}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 border-2 border-green-400"
                    style={{ width: 'fit-content', minWidth: '320px' }}
                  >
                    <i className="fas fa-percentage mr-3"></i>
                    Get Flat 50% Discount on Any Order
                    <i className="fas fa-gift ml-3"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-users text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Real Followers</h3>
                <p className="text-cream/80">High-quality Indian and international followers starting from ₹24/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-heart text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Instant Likes</h3>
                <p className="text-cream/80">Boost engagement with authentic likes starting from ₹12/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-eye text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Video Views</h3>
                <p className="text-cream/80">Increase video reach with premium views starting from ₹11/1000</p>
              </div>

              <div className="bg-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-gold/20 to-tan/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-comments text-gold text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Comments</h3>
                <p className="text-cream/80">Drive conversations with comments starting from ₹18/1000</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-charcoal border border-gold/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gold mb-8">Why Choose InstaBoost Pro?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">50K+</div>
                  <div className="text-cream/70">Happy Customers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">24/7</div>
                  <div className="text-cream/70">Customer Support</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gold mb-2">99.9%</div>
                  <div className="text-cream/70">Delivery Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsFromBonus(false);
        }}
        isFromBonus={isFromBonus}
      />
    </>
  );
}