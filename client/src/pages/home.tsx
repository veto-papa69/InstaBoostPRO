import { useState } from "react";
import { Link } from "wouter";
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const claimBonus = useClaimBonus();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFromBonus, setIsFromBonus] = useState(false);

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

  return (
    <>
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="px-4 mb-16">
          <div className="max-w-7xl mx-auto">
            {/* Announcement Banner */}
            <div className="relative overflow-hidden rounded-xl mb-6 backdrop-blur-md bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-600/20 border border-orange-400/30 shadow-lg">
              <div className="whitespace-nowrap animate-marquee py-3">
                <span className="text-sm font-bold px-8 text-orange-200 drop-shadow-lg">
                  🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉 EID FESTIVAL समाप्त - अब सभी सर्विस की कीमतें बढ़ गई हैं! 🎉 EID FESTIVAL ENDED - ALL SERVICE PRICES HAVE BEEN INCREASED! 🎉
                </span>
              </div>
            </div>
            
            <div 
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-dark border border-gold/20 mb-16"
              style={{
                background: `linear-gradient(135deg, rgba(18, 38, 32, 0.95), rgba(28, 45, 36, 0.95)), linear-gradient(45deg, rgba(214, 173, 96, 0.1), rgba(214, 173, 96, 0.05))`,
              }}
            >
              <div className="px-8 py-16 md:px-16 md:py-24 text-center">
                <div className="inline-block bg-gradient-to-r from-gold to-tan text-charcoal-dark px-6 py-2 rounded-full font-bold mb-6 text-sm uppercase tracking-wide">
                  🚀 Premium SMM Panel
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

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={() => {
                      setIsFromBonus(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="btn-primary hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-rocket mr-2"></i>Get Started Free
                  </Button>
                  <Link href="/services">
                    <Button variant="outline" className="btn-outline">
                      <i className="fas fa-eye mr-2"></i>View Services
                    </Button>
                  </Link>
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
