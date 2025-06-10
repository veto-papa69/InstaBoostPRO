import React from 'react';
import { useAuth, useClaimBonus } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, Shield, Clock, Users } from 'lucide-react';
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

      {/* Main Content */}
      <div className="pt-8 pb-16 px-4">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary-text mb-6">
              Welcome to <span className="text-gold">InstaBoost</span>
            </h1>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Professional Instagram Growth Services - Boost your social media presence with our premium services
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-text">50K+</div>
                <p className="text-muted-text">Happy Customers</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardContent className="pt-6">
                <Sparkles className="h-8 w-8 text-success-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-text">14</div>
                <p className="text-muted-text">Premium Services</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-text">24/7</div>
                <p className="text-muted-text">Fast Delivery</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-error-red mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-text">100%</div>
                <p className="text-muted-text">Secure & Safe</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold">
                  <Users className="h-5 w-5" />
                  Instagram Followers
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Get real, active followers from India, USA, and worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  High-quality followers that engage with your content and help grow your presence organically.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success-green">
                  <Sparkles className="h-5 w-5" />
                  Instagram Likes
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Boost your posts with authentic likes from real accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Increase engagement on your posts with likes from real, active Instagram users.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg shadow-lg hover:shadow-xl transition-shadow border border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gold">
                  <Clock className="h-5 w-5" />
                  Fast Delivery
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Quick processing and delivery of all services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-text">
                  Get your orders processed and delivered within minutes of placing them.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-gold to-tan text-charcoal-dark shadow-2xl border border-gold">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4 text-charcoal-dark">
                Ready to Grow Your Instagram?
              </h2>
              <p className="text-xl mb-6 text-charcoal-dark/80">
                Join thousands of satisfied customers and boost your social media presence today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services">
                  <Button
                    size="lg"
                    className="bg-charcoal-dark text-cream hover:bg-charcoal font-semibold px-8"
                  >
                    View Services
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal-dark text-charcoal-dark hover:bg-charcoal-dark hover:text-cream font-semibold px-8"
                  onClick={handleClaimBonus}
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
