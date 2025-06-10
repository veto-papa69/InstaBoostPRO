
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
    <div className="min-h-screen bg-[#0e1d18]">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-3 shadow-lg border-b-2 border-yellow-400 overflow-hidden">
        <div className="animate-scroll">
          <span className="text-lg font-bold inline-block pr-20 text-yellow-100">
            🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨 EID FESTIVAL EVENT ENDED - SERVICE PRICES HAVE BEEN INCREASED! 🚨
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6">
            Welcome to <span className="text-blue-400">InstaBoost</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Professional Instagram Growth Services - Boost your social media presence with our premium services
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">50K+</div>
            <p className="text-gray-400">Happy Customers</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Sparkles className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">14</div>
            <p className="text-gray-400">Premium Services</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <p className="text-gray-400">Fast Delivery</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <p className="text-gray-400">Secure & Safe</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Instagram Followers */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-blue-400">Instagram Followers</CardTitle>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit">
                Most Popular - Best Value - Cheap & Fast
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                High-quality followers that engage with your content and help grow your presence organically.
              </p>
            </CardContent>
          </Card>

          {/* Instagram Likes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-6 w-6 text-green-400" />
                <CardTitle className="text-green-400">Instagram Likes</CardTitle>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-black px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit">
                New Fast - Real Fast - Instant Fast
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Increase engagement on your posts with likes from real, active instagram users.
              </p>
            </CardContent>
          </Card>

          {/* Fast Delivery */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-purple-400">Fast Delivery</CardTitle>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-black px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit">
                Start within minutes of placing an order
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Get your orders processed and delivered within minutes of placing them.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Bonus Section */}
        {!user?.bonusClaimed && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center mb-16">
            <h3 className="text-2xl font-bold text-white mb-4">Welcome Bonus Available!</h3>
            <p className="text-blue-100 mb-6">Get ₹10 free bonus when you sign up - No purchase required!</p>
            <Button
              onClick={handleClaimBonus}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              Claim Your Bonus
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Boost Your Instagram?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                View All Services
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => !isAuthenticated ? setIsAuthModalOpen(true) : null}
            >
              Get Started Free
            </Button>
          </div>
        </div>
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
