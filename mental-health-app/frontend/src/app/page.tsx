'use client'

import { motion } from 'framer-motion'
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  Bot, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: MessageCircle,
    title: 'Anonymous Support Forum',
    description: 'Connect with others in a safe, anonymous community where you can share experiences and receive support.',
    color: 'text-blue-500'
  },
  {
    icon: Users,
    title: 'Professional Guidance',
    description: 'Chat privately with verified mental health professionals who understand your journey.',
    color: 'text-green-500'
  },
  {
    icon: BarChart3,
    title: 'Mood Tracking',
    description: 'Track your daily mood and receive personalized recommendations for movies, music, and activities.',
    color: 'text-purple-500'
  },
  {
    icon: Calendar,
    title: 'Habit Building',
    description: 'Create and maintain healthy habits with our intuitive calendar and streak tracking system.',
    color: 'text-orange-500'
  },
  {
    icon: Bot,
    title: 'AI Companion',
    description: '24/7 emotional support from our intelligent chatbot trained to provide compassionate guidance.',
    color: 'text-pink-500'
  },
  {
    icon: Shield,
    title: 'Crisis Detection',
    description: 'Advanced safety features that detect distress and connect you with immediate help when needed.',
    color: 'text-red-500'
  }
]

const testimonials = [
  {
    name: 'Anonymous User',
    role: 'Community Member',
    content: 'This platform gave me hope when I needed it most. The anonymous forum helped me realize I wasn\'t alone.',
    rating: 5
  },
  {
    name: 'Dr. Sarah M.',
    role: 'Licensed Therapist',
    content: 'As a mental health professional, I appreciate how this platform prioritizes user safety and privacy.',
    rating: 5
  },
  {
    name: 'Anonymous User',
    role: 'Patient',
    content: 'The mood tracking feature helped me identify patterns and triggers I never noticed before.',
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-blue-50 dark:from-background-dark dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-gradient">MindCare</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your Journey to{' '}
            <span className="text-gradient">Better Mental Health</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A comprehensive platform providing anonymous support, professional guidance, 
            and personalized tools to help you build resilience and find hope.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/about" className="btn btn-secondary text-lg px-8 py-4">
              Learn More
            </Link>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-500">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Anonymous & Safe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-500">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">10k+</div>
              <div className="text-gray-600 dark:text-gray-400">Lives Touched</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need for{' '}
              <span className="text-gradient">Mental Wellness</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform combines professional support, community connection, 
              and personal growth tools in one secure, anonymous environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card p-8 card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Tracker Preview */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Track Your Mood,{' '}
                <span className="text-gradient">Transform Your Life</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our intelligent mood tracking system provides personalized recommendations 
                based on how you're feeling, helping you discover new ways to improve your wellbeing.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent-500 mr-3" />
                  <span>Daily mood check-ins with 4 emotion categories</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent-500 mr-3" />
                  <span>Personalized movie, music, and exercise recommendations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent-500 mr-3" />
                  <span>Weekly mood trends and insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent-500 mr-3" />
                  <span>Save your favorite recommendations</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-6 text-center mood-happy text-white">
                  <div className="text-4xl mb-2">😊</div>
                  <div className="font-semibold">Happy</div>
                </div>
                <div className="card p-6 text-center mood-neutral">
                  <div className="text-4xl mb-2">😐</div>
                  <div className="font-semibold">Neutral</div>
                </div>
                <div className="card p-6 text-center mood-sad">
                  <div className="text-4xl mb-2">😔</div>
                  <div className="font-semibold">Sad</div>
                </div>
                <div className="card p-6 text-center mood-anxious">
                  <div className="text-4xl mb-2">😟</div>
                  <div className="font-semibold">Anxious</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Stories of{' '}
              <span className="text-gradient">Hope & Healing</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real experiences from our community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-accent-500">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join thousands of others who have found hope, support, and healing 
              through our comprehensive mental health platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn bg-white text-primary-500 hover:bg-gray-100 text-lg px-8 py-4">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/crisis" className="btn bg-white/20 text-white hover:bg-white/30 text-lg px-8 py-4">
                Need Help Now?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold">MindCare</span>
              </div>
              <p className="text-gray-400">
                Supporting your mental health journey with compassion, privacy, and professional care.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/forum" className="hover:text-white">Community Forum</Link></li>
                <li><Link href="/chat" className="hover:text-white">Professional Chat</Link></li>
                <li><Link href="/mood" className="hover:text-white">Mood Tracker</Link></li>
                <li><Link href="/habits" className="hover:text-white">Habit Builder</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/crisis" className="hover:text-white">Crisis Resources</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Emergency</h3>
              <div className="text-gray-400 space-y-2">
                <p>If you're in crisis, please reach out:</p>
                <p className="text-white font-semibold">988 - Suicide & Crisis Lifeline</p>
                <p className="text-white font-semibold">911 - Emergency Services</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MindCare. All rights reserved. Made with ❤️ for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}