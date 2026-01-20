import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Droplets, Calendar, Clock, Shield, Star, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import AICallDemo from '../components/AICallDemo';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [submittedContact, setSubmittedContact] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/contacts`, formData);
      toast.success('Thank you! Our AI agent will call you shortly.');
      setSubmittedContact(response.data);
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <Clock className="w-6 h-6 text-sky-500" />,
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling that finds the perfect time for your window cleaning.'
    },
    {
      icon: <Shield className="w-6 h-6 text-sky-500" />,
      title: 'Instant Confirmation',
      description: 'Get immediate callback to confirm your request and answer questions.'
    },
    {
      icon: <Star className="w-6 h-6 text-sky-500" />,
      title: 'Professional Service',
      description: 'Trained professionals delivering spotless results every time.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Droplets className="w-8 h-8 text-sky-500" />
              <span className="font-bold text-xl text-slate-900">Crystal Clear</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-sky-500 transition-colors">Features</a>
              <a href="#demo" className="text-slate-600 hover:text-sky-500 transition-colors">AI Demo</a>
              <Link to="/dashboard" className="text-slate-600 hover:text-sky-500 transition-colors">Dashboard</Link>
              <Button 
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6"
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                data-testid="nav-get-quote-btn"
              >
                Get a Quote
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-slate-600 py-2">Features</a>
              <a href="#demo" className="text-slate-600 py-2">AI Demo</a>
              <Link to="/dashboard" className="text-slate-600 py-2">Dashboard</Link>
              <Button 
                className="bg-sky-500 hover:bg-sky-600 text-white rounded-full w-full"
                onClick={() => {
                  document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
              >
                Get a Quote
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 hero-gradient" id="contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left - Content & Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Phone className="w-4 h-4" />
                  AI-Powered Service
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Crystal Clear Windows,<br />
                  <span className="text-sky-500">Intelligent Service</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-lg">
                  Experience the future of window washing. Our AI agent will call you to confirm your request and schedule your service.
                </p>
              </div>

              {/* Contact Form */}
              <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden" data-testid="contact-form-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Get Started Today</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12 bg-slate-50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12 bg-slate-50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-12 bg-slate-50 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20"
                        data-testid="input-phone"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-orange-500/25 transition-all"
                      disabled={isSubmitting}
                      data-testid="submit-contact-btn"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request a Call Back'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                  <p className="text-sm text-slate-500 mt-4 text-center">
                    Our AI agent will call you within minutes to confirm.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right - Image */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/6873122/pexels-photo-6873122.jpeg" 
                  alt="Professional window washing service"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">JD</div>
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">MK</div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">RP</div>
                      </div>
                      <div>
                        <p className="text-white font-semibold">500+ Happy Customers</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-white/80 text-sm ml-1">4.9/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Crystal Clear?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We combine cutting-edge AI technology with professional cleaning services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 card-hover rounded-xl"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Phone className="w-4 h-4" />
              Interactive Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Experience Our AI Agent
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See how our AI handles customer calls - from confirmation to scheduling.
            </p>
          </div>

          <AICallDemo contact={submittedContact} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready for Crystal Clear Windows?
          </h2>
          <p className="text-lg text-sky-100 mb-8">
            Join hundreds of satisfied customers who trust our AI-powered service.
          </p>
          <Button 
            className="bg-white text-sky-600 hover:bg-sky-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg"
            onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
            data-testid="cta-get-started-btn"
          >
            Get Started Now
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Droplets className="w-6 h-6 text-sky-400" />
              <span className="font-bold text-lg text-white">Crystal Clear Windows</span>
            </div>
            <div className="flex items-center gap-8 text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 Crystal Clear Windows. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
