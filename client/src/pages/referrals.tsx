import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Link } from "wouter";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  isEligibleForDiscount: boolean;
  hasClaimedDiscount: boolean;
}

export default function Referrals() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: referralData, refetch } = useQuery<ReferralData>({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
  });

  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/referrals/claim-reward", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to claim reward");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reward Claimed!",
        description: "You can now enjoy 50% discount on all services!",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show auth modal immediately if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-8" style={{ backgroundColor: 'var(--main-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="mb-8">
              <i className="fas fa-lock text-gold text-6xl mb-6"></i>
              <h1 className="text-4xl font-bold text-gold mb-4">Login Required</h1>
              <p className="text-xl text-cream/70 mb-8">Please login with your Instagram account to access referral discounts</p>
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

  const copyReferralLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopiedLink(true);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleClaimReward = () => {
    claimRewardMutation.mutate();
  };

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gold mb-4">Referral Program</h1>
            <p className="text-xl text-cream/70">
              Invite 5 friends and get 50% discount on all services!
            </p>
          </div>

          {/* Gamified Referral Stats */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-8 mb-8 relative overflow-hidden">
            {/* Achievement Level Indicator */}
            <div className="absolute top-4 right-4">
              {(referralData?.referralCount || 0) >= 5 ? (
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold animate-pulse">
                  <i className="fas fa-crown mr-2"></i>
                  MASTER
                </div>
              ) : (referralData?.referralCount || 0) >= 3 ? (
                <div className="flex items-center bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full font-bold">
                  <i className="fas fa-star mr-2"></i>
                  EXPERT
                </div>
              ) : (referralData?.referralCount || 0) >= 1 ? (
                <div className="flex items-center bg-gradient-to-r from-blue-400 to-green-500 text-white px-4 py-2 rounded-full font-bold">
                  <i className="fas fa-medal mr-2"></i>
                  ROOKIE
                </div>
              ) : (
                <div className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-full">
                  <i className="fas fa-user mr-2"></i>
                  BEGINNER
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6 relative group hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-gold mb-3 flex items-center justify-center">
                    <i className="fas fa-users mr-2 text-2xl"></i>
                    {referralData?.referralCount || 0}
                  </div>
                  <div className="text-cream/70 font-medium">Successful Referrals</div>
                  <div className="mt-2 text-sm text-gold">
                    +{(referralData?.referralCount || 0) * 10}% Progress
                  </div>
                </div>
              </div>
              
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6 relative group hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-green-400 mb-3 flex items-center justify-center">
                    <i className="fas fa-target mr-2 text-2xl"></i>
                    {5 - (referralData?.referralCount || 0) > 0 ? 5 - (referralData?.referralCount || 0) : 0}
                  </div>
                  <div className="text-cream/70 font-medium">Referrals Needed</div>
                  <div className="mt-2 text-sm text-green-400">
                    {(referralData?.referralCount || 0) >= 5 ? "🎯 Target Achieved!" : "Keep going!"}
                  </div>
                </div>
              </div>
              
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6 relative group hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-purple-400 mb-3 flex items-center justify-center">
                    <i className="fas fa-percentage mr-2 text-2xl"></i>
                    50
                  </div>
                  <div className="text-cream/70 font-medium">Discount Reward</div>
                  <div className="mt-2 text-sm text-purple-400">
                    {(referralData?.referralCount || 0) >= 5 ? "🎁 Available!" : "Almost there!"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar with Milestones */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gold flex items-center">
                <i className="fas fa-chart-line mr-2"></i>
                Referral Journey
              </h3>
              <span className="text-cream/70 text-lg font-medium">
                {referralData?.referralCount || 0}/5 referrals
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative mb-8">
              <div className="w-full bg-charcoal-dark rounded-full h-6 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-6 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${((referralData?.referralCount || 0) / 5) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              
              {/* Milestone Markers */}
              <div className="absolute top-0 left-0 w-full h-6 flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((milestone) => (
                  <div 
                    key={milestone}
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      (referralData?.referralCount || 0) >= milestone
                        ? 'bg-green-500 border-green-400 text-white animate-pulse'
                        : 'bg-charcoal-dark border-gray-500 text-gray-400'
                    }`}
                    style={{ left: `${((milestone - 1) / 4) * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    {(referralData?.referralCount || 0) >= milestone ? (
                      <i className="fas fa-check text-sm"></i>
                    ) : (
                      <span className="text-xs font-bold">{milestone}</span>
                    )}
                    
                    {/* Milestone Label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap">
                      <div className={`font-medium ${(referralData?.referralCount || 0) >= milestone ? 'text-green-400' : 'text-gray-500'}`}>
                        {milestone === 1 && 'First Friend'}
                        {milestone === 2 && 'Getting Started'}
                        {milestone === 3 && 'Halfway There'}
                        {milestone === 4 && 'Almost Done'}
                        {milestone === 5 && 'Reward Unlocked!'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="text-center mt-12">
              {(referralData?.referralCount || 0) === 0 && (
                <p className="text-cream/70 text-lg">🚀 Start your referral journey! Share your link with friends.</p>
              )}
              {(referralData?.referralCount || 0) === 1 && (
                <p className="text-blue-400 text-lg">🎉 Great start! You've got your first referral. Keep going!</p>
              )}
              {(referralData?.referralCount || 0) === 2 && (
                <p className="text-purple-400 text-lg">⭐ You're building momentum! 3 more to go.</p>
              )}
              {(referralData?.referralCount || 0) === 3 && (
                <p className="text-orange-400 text-lg">🔥 Halfway there! You're doing amazing!</p>
              )}
              {(referralData?.referralCount || 0) === 4 && (
                <p className="text-yellow-400 text-lg">💎 So close! Just one more friend to unlock your reward!</p>
              )}
              {(referralData?.referralCount || 0) >= 5 && (
                <p className="text-green-400 text-lg font-bold">🏆 Congratulations! You've mastered the referral game!</p>
              )}
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gold mb-4">Your Referral Link</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-charcoal-dark border border-gold/10 rounded-lg p-4">
                <div className="text-cream/70 text-sm mb-1">Share this link:</div>
                <div className="text-cream font-mono text-sm break-all">
                  {referralData?.referralLink || "Loading..."}
                </div>
              </div>
              <Button 
                onClick={copyReferralLink}
                className="btn-primary whitespace-nowrap"
                disabled={!referralData?.referralLink}
              >
                <i className={`fas ${copiedLink ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gold mb-6">How it Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-charcoal font-bold">1</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Share Your Link</h4>
                <p className="text-cream/70 text-sm">Copy and share your unique referral link with friends</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-charcoal font-bold">2</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Friends Join</h4>
                <p className="text-cream/70 text-sm">When 5 unique friends sign up using your link</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-charcoal font-bold">3</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Get Reward</h4>
                <p className="text-cream/70 text-sm">Claim your 50% discount on all services</p>
              </div>
            </div>
          </div>

          {/* Enhanced Claim Reward Button */}
          {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && (
            <div className="text-center relative">
              {/* Celebration Animation */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 flex space-x-4 animate-bounce">
                <span className="text-4xl">🎉</span>
                <span className="text-4xl">🎊</span>
                <span className="text-4xl">🎁</span>
                <span className="text-4xl">🎊</span>
                <span className="text-4xl">🎉</span>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-8 mb-8">
                <h3 className="text-3xl font-bold text-yellow-400 mb-4 animate-pulse">
                  🏆 Mission Accomplished! 🏆
                </h3>
                <p className="text-xl text-cream mb-6">
                  You've successfully referred 5 friends! Time to claim your exclusive reward.
                </p>
                
                <Button 
                  onClick={handleClaimReward}
                  disabled={claimRewardMutation.isPending}
                  className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-black text-2xl px-16 py-8 rounded-2xl shadow-2xl hover:scale-110 transition-all duration-500 transform-gpu"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 2s ease infinite'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  <div className="relative z-10 flex items-center">
                    {claimRewardMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-4 text-2xl"></i>
                        Claiming Your Reward...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trophy mr-4 text-2xl animate-bounce"></i>
                        Claim Your 50% Discount Reward
                        <i className="fas fa-star ml-4 text-2xl animate-pulse"></i>
                      </>
                    )}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-300 -z-10 animate-pulse"></div>
                </Button>
              </div>
            </div>
          )}

          {referralData?.hasClaimedDiscount && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl opacity-20">🏆</div>
                <i className="fas fa-check-circle text-green-400 text-5xl mb-6 animate-pulse"></i>
                <h3 className="text-3xl font-semibold text-green-400 mb-4">🎉 Reward Successfully Claimed! 🎉</h3>
                <p className="text-xl text-cream/90 mb-6">
                  Congratulations! You now have lifetime access to 50% discount on all our premium services!
                </p>
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 mb-6">
                  <p className="text-green-300 font-medium">
                    ✨ Your exclusive discount is automatically applied at checkout
                  </p>
                </div>
              </div>
              <Link href="/reward-services">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-6 rounded-xl hover:scale-105 transition-all duration-300">
                  <i className="fas fa-shopping-bag mr-3"></i>
                  Shop with 50% Discount Now
                  <i className="fas fa-arrow-right ml-3"></i>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
