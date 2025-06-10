
import React from 'react';
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, Shield, Clock, Users, MessageCircle, Eye, Heart } from 'lucide-react';
import { useState } from "react";
import { Link } from "wouter";
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
    <div className="min-h-screen bg-main-bg">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-3 shadow-lg border-b-2 border-yellow-400 overflow-hidden">
        <div className="animate-scroll">
          <span className="text-lg font-bold inline-block pr-20 text-yellow-100">
            🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Hero Card */}
        <div className="bg-card-bg rounded-3xl p-12 mb-12 border border-gold/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-gold" />
              <span className="text-gold font-semibold">PREMIUM SMM PANEL</span>
            </div>
            <h1 className="text-5xl font-bold text-primary-text mb-6">
              Boost Your Social Media<br />Instantly
            </h1>
            <p className="text-xl text-muted-text max-w-2xl mx-auto mb-8">
              Get premium followers, likes, views, and comments at competitive prices starting from ₹11/1000
            </p>
          </div>

          {/* Welcome Bonus Card */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-gradient-to-br from-gold/20 to-tan/20 border-gold shadow-xl">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold text-gold mb-2">Welcome Bonus</h3>
                <p className="text-muted-text mb-4">Claim your free followers now!</p>
                <Button
                  onClick={handleClaimBonus}
                  className="bg-gold text-charcoal-dark hover:bg-tan font-semibold px-6"
                  disabled={user?.bonusClaimed}
                >
                  {user?.bonusClaimed ? "Bonus Claimed" : "Claim Bonus"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-charcoal-dark hover:bg-gray-100 font-semibold px-8"
              onClick={() => !isAuthenticated ? setIsAuthModalOpen(true) : null}
            >
              Get Started Free
            </Button>
            <Link to="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-charcoal-dark font-semibold px-8"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card-bg border border-gold/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-gold mb-4" />
              <h3 className="text-xl font-bold text-primary-text mb-2">Real Followers</h3>
              <p className="text-muted-text mb-4">
                High-quality Indian and international followers starting from ₹24/1000
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border border-gold/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 text-success-green mb-4" />
              <h3 className="text-xl font-bold text-primary-text mb-2">Instant Likes</h3>
              <p className="text-muted-text mb-4">
                Boost engagement with authentic likes starting from ₹12/1000
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border border-gold/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <Eye className="h-8 w-8 text-gold mb-4" />
              <h3 className="text-xl font-bold text-primary-text mb-2">Video Views</h3>
              <p className="text-muted-text mb-4">
                Increase video reach with premium views starting from ₹11/1000
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card-bg border border-gold/20 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-gold mb-4" />
              <h3 className="text-xl font-bold text-primary-text mb-2">Comments</h3>
              <p className="text-muted-text mb-4">
                Drive conversations with comments starting from ₹18/1000
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Section */}
        <Card className="bg-card-bg border border-gold/20 shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center text-primary-text mb-8">
              Why Choose InstaBoost Pro?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gold mb-2">50K+</div>
                <p className="text-muted-text">Happy Customers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-2">24/7</div>
                <p className="text-muted-text">Customer Support</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-2">99.9%</div>
                <p className="text-muted-text">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsFromBonus(false);
        }}
        isFromBonus={isFromBonus}
      />
    </div>
  );
}
