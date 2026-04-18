import { Link } from "wouter";
import { ArrowRight, BarChart3, Globe, Search, Shield, Star, TrendingUp, Users, Zap, Mail, Phone, MapPin } from "lucide-react";

const services = [
  { icon: Search, title: "SEO Optimization", desc: "Rank higher on Google with data-driven strategies, technical audits, and content optimization." },
  { icon: Globe, title: "Local SEO", desc: "Dominate local search results and attract customers in your area with targeted local strategies." },
  { icon: TrendingUp, title: "E-Commerce SEO", desc: "Drive targeted traffic to your store and convert visitors into customers with product-level optimization." },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Monthly detailed reports with real KPIs, rankings, traffic analysis, and ROI tracking." },
  { icon: Zap, title: "Technical SEO", desc: "Fix crawl errors, improve site speed, optimize Core Web Vitals, and build solid site architecture." },
  { icon: Star, title: "Content Strategy", desc: "Create keyword-rich, authoritative content that ranks and converts across the customer journey." },
];

const reasons = [
  { stat: "500+", label: "Clients Served" },
  { stat: "97%", label: "Client Retention Rate" },
  { stat: "3.2x", label: "Average Traffic Growth" },
  { stat: "8 Yrs", label: "Industry Experience" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#09090f]/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-black tracking-tight text-white">PRIME LINK</span>
            <span className="text-xl font-black tracking-tight text-blue-500"> OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#careers" className="hover:text-white transition-colors">Careers</a>
          </div>
          <a href="#contact" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <Zap className="h-3 w-3" />
              Powering Growth for 500+ Businesses
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
              Rank Higher.<br />
              <span className="text-blue-500">Grow Faster.</span><br />
              Win Online.
            </h1>
            <p className="text-xl text-white/50 mb-10 max-w-xl leading-relaxed">
              Prime Link delivers premium SEO services that drive real organic traffic, qualified leads, and measurable business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                Start Growing Now <ArrowRight className="h-5 w-5" />
              </a>
              <a href="#services" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {reasons.map((r) => (
              <div key={r.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">{r.stat}</div>
                <div className="text-sm text-white/40 font-medium uppercase tracking-widest">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Our Services</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Full-stack SEO solutions tailored to your business goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="group bg-white/[0.03] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <s.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">Why Choose Prime Link?</h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                We don't just run campaigns — we build data-driven growth systems that compound over time. Our team of SEO specialists becomes an extension of your business.
              </p>
              <div className="space-y-4">
                {[
                  "Transparent monthly reporting with real KPIs",
                  "Dedicated account manager for every client",
                  "Proven strategies tailored to your industry",
                  "No long-term contracts — results earn your loyalty",
                  "White-hat, Google-compliant methodologies only",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    </div>
                    <p className="text-white/60 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "100% White-Hat", desc: "Only Google-compliant strategies" },
                { icon: BarChart3, title: "Data-Driven", desc: "Every decision backed by data" },
                { icon: Users, title: "Dedicated Team", desc: "Expert specialists for your account" },
                { icon: TrendingUp, title: "Proven Results", desc: "Consistent growth across industries" },
              ].map((item) => (
                <div key={item.title} className="bg-white/[0.04] border border-white/5 rounded-2xl p-6">
                  <item.icon className="h-8 w-8 text-blue-400 mb-4" />
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Let's Talk Growth</h2>
            <p className="text-white/40 text-lg">Ready to dominate your market? Get a free SEO audit today.</p>
          </div>
          <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/5 rounded-2xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Your Name" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white" />
              <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white" />
            </div>
            <input type="text" placeholder="Your Website URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white mb-4" />
            <textarea rows={4} placeholder="Tell us about your goals..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white mb-4 resize-none" />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">
              Request Free Audit
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 text-white/30 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" />contact@primelink.io</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" />+1 (800) PRIME-01</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />New York, NY</div>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Join Our Team</h2>
          <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto">We're always looking for talented SEO specialists, content writers, and digital marketers to join our growing team.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {["SEO Specialist", "Content Strategist", "Account Manager"].map((role) => (
              <div key={role} className="bg-white/[0.04] border border-white/5 rounded-xl p-6">
                <h3 className="font-bold mb-2">{role}</h3>
                <p className="text-white/30 text-sm mb-4">Remote • Full-time</p>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Now Hiring</span>
              </div>
            ))}
          </div>
          <a href="mailto:careers@primelink.io" className="inline-flex items-center gap-2 border border-white/10 hover:border-blue-500/30 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
            Send Your Resume <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-black text-white">PRIME LINK</span>
            <span className="font-black text-blue-500"> OS</span>
          </div>
          <p className="text-white/20 text-sm">2024 Prime Link. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
