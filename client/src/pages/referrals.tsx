
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

          {/* Referral Stats */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6">
                <div className="text-3xl font-bold text-gold mb-2">
                  {referralData?.referralCount || 0}
                </div>
                <div className="text-cream/70">Successful Referrals</div>
              </div>
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {5 - (referralData?.referralCount || 0) > 0 ? 5 - (referralData?.referralCount || 0) : 0}
                </div>
                <div className="text-cream/70">Referrals Needed</div>
              </div>
              <div className="bg-charcoal-dark border border-gold/10 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">50%</div>
                <div className="text-cream/70">Discount Reward</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-charcoal border border-gold/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gold">Progress to Reward</h3>
              <span className="text-cream/70">
                {referralData?.referralCount || 0}/5 referrals
              </span>
            </div>
            <div className="w-full bg-charcoal-dark rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((referralData?.referralCount || 0) / 5) * 100}%` }}
              ></div>
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

          {/* Claim Reward Button */}
          {referralData?.isEligibleForDiscount && !referralData?.hasClaimedDiscount && (
            <div className="text-center">
              <Button 
                onClick={handleClaimReward}
                disabled={claimRewardMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 pulse-glow"
              >
                {claimRewardMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-3"></i>
                ) : (
                  <i className="fas fa-gift mr-3"></i>
                )}
                Claim Your Reward Now!
              </Button>
            </div>
          )}

          {referralData?.hasClaimedDiscount && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6 mb-6">
                <i className="fas fa-check-circle text-green-400 text-3xl mb-4"></i>
                <h3 className="text-xl font-semibold text-green-400 mb-2">Reward Claimed!</h3>
                <p className="text-cream/70">You now have access to 50% discount on all services</p>
              </div>
              <Link href="/services">
                <Button className="btn-primary text-lg px-8 py-4">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  Shop with 50% Discount
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
