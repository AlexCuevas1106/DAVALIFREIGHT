import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Shield, Clock, Trophy } from "lucide-react";
import type { Driver } from "@shared/schema";

interface WelcomeAnimationProps {
  user: Driver;
  onComplete: () => void;
}

export function WelcomeAnimation({ user, onComplete }: WelcomeAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Return early if no user
  if (!user) {
    onComplete();
    return null;
  }

  // Get personalized greeting based on time and user role
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good evening";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 18) timeGreeting = "Good afternoon";

    const roleMessage = user.role === "admin" 
      ? "Ready to manage your fleet?"
      : "Ready to hit the road?";

    return { timeGreeting, roleMessage };
  };

  const { timeGreeting, roleMessage } = getPersonalizedGreeting();

  // Animation steps
  const steps = [
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: `${timeGreeting}, ${user.name || 'User'}!`,
      subtitle: "Welcome back to Davali Freight",
      duration: 2000
    },
    {
      icon: user.role === "admin" ? <Shield className="w-12 h-12 text-green-600" /> : <Clock className="w-12 h-12 text-orange-600" />,
      title: user.role === "admin" ? "Admin Dashboard" : "Driver Portal",
      subtitle: roleMessage,
      duration: 1500
    },
    {
      icon: <Trophy className="w-12 h-12 text-yellow-600" />,
      title: "Let's get started!",
      subtitle: "Loading your dashboard...",
      duration: 1000
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep === steps.length - 1) {
          setTimeout(onComplete, 500);
        } else {
          setCurrentStep(currentStep + 1);
        }
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center z-50">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.2, y: -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 p-8 max-w-md mx-auto">
            <CardContent className="text-center space-y-6">
              {/* Icon animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="flex justify-center"
              >
                {steps[currentStep].icon}
              </motion.div>

              {/* Title animation */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl font-bold text-gray-900"
              >
                {steps[currentStep].title}
              </motion.h1>

              {/* Subtitle animation */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-gray-600"
              >
                {steps[currentStep].subtitle}
              </motion.p>

              {/* Progress dots */}
              <motion.div 
                className="flex justify-center space-x-2 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </motion.div>

              {/* User avatar initial */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl"
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}