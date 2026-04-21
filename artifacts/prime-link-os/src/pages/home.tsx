import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Globe, Search, Shield, Star, TrendingUp, Users, Zap, MapPin, Check, Rocket, Target, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { useListPlans, useListPages, useCreateAuditRequest } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

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

const PLAN_STYLES = [
  {
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    checkColor: "text-emerald-400",
    checkBg: "bg-emerald-500/15",
    priceColor: "text-emerald-400",
    btnClass: "bg-emerald-600 hover:bg-emerald-500",
    icon: Rocket,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    glow: "shadow-emerald-500/10",
    tag: "Starter",
  },
  {
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    border: "border-blue-500/30",
    badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    checkColor: "text-blue-400",
    checkBg: "bg-blue-500/15",
    priceColor: "text-blue-400",
    btnClass: "bg-blue-600 hover:bg-blue-500",
    icon: TrendingUp,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    glow: "shadow-blue-500/10",
    tag: "Growth",
  },
  {
    gradient: "from-violet-500/25 via-violet-500/10 to-transparent",
    border: "border-violet-500/40",
    badgeBg: "bg-violet-500/20 text-violet-200 border-violet-500/40",
    checkColor: "text-violet-400",
    checkBg: "bg-violet-500/15",
    priceColor: "text-violet-300",
    btnClass: "bg-violet-600 hover:bg-violet-500",
    icon: Star,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/20",
    glow: "shadow-violet-500/20",
    tag: "Pro",
    highlight: true,
  },
  {
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
    border: "border-red-500/30",
    badgeBg: "bg-red-500/15 text-red-300 border-red-500/30",
    checkColor: "text-red-400",
    checkBg: "bg-red-500/15",
    priceColor: "text-red-400",
    btnClass: "bg-red-600 hover:bg-red-500",
    icon: Crown,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/15",
    glow: "shadow-red-500/10",
    tag: "Elite",
  },
];

export default function HomePage() {
  const { data: plans } = useListPlans();
  const { data: footerPages } = useListPages({ visibleOnly: true });
  const createRequest = useCreateAuditRequest();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", business: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    createRequest.mutate(
      { data: form },
      {
        onSuccess: () => {
          setSubmitted(true);
          setForm({ name: "", email: "", business: "", phone: "", message: "" });
          toast({ title: "Request sent!", description: "We'll be in touch shortly." });
        },
        onError: (err: Error) =>
          toast({ title: "Submission failed", description: err.message, variant: "destructive" }),
      },
    );
  };

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
            <a href="#plans" className="hover:text-white transition-colors">Plans</a>
            <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
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
              Prime Link delivers premium Local SEO services for clinics, gyms, salons, restaurants, and all local businesses that want more customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#plans" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                View Our Plans <ArrowRight className="h-5 w-5" />
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
            <p className="text-white/40 text-lg max-w-xl mx-auto">Full-stack Local SEO solutions tailored to your business goals</p>
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

      {/* Plans */}
      <section id="plans" className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-4">
              <Target className="h-3.5 w-3.5" />
              Prime Link Local SEO Services
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">4 Powerful Plans</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Designed for clinics, gyms, salons, restaurants, shops, and all local businesses that want more customers from their city/area.
            </p>
          </div>

          {(plans ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-14">
              {(plans ?? []).map((plan, idx) => {
                const style = PLAN_STYLES[idx % PLAN_STYLES.length];
                const Icon = style.icon;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border ${style.border} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${style.glow} ${style.highlight ? "ring-1 ring-violet-500/40" : ""}`}
                  >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-b ${style.gradient} p-6 pb-5`}>
                      {plan.badge && (
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border mb-4 ${style.badgeBg}`}>
                          <Star className="h-3 w-3" />
                          {plan.badge}
                        </div>
                      )}
                      <div className={`w-11 h-11 ${style.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${style.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-white/40 text-xs leading-relaxed mb-5">{plan.description}</p>
                      )}
                      <div className="flex items-end gap-1">
                        <span className="text-white/40 text-sm font-semibold">₹</span>
                        <span className={`text-4xl font-black ${style.priceColor}`}>
                          {plan.clientPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-white/30 text-xs mt-1">one-time plan</p>
                    </div>

                    {/* Features */}
                    <div className="px-6 pb-6 bg-[#09090f]/60">
                      {plan.features.length > 0 && (
                        <div className="py-5 space-y-3 border-t border-white/5">
                          {plan.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={`w-4 h-4 ${style.checkBg} rounded-full flex items-center justify-center mt-0.5 shrink-0`}>
                                <Check className={`h-2.5 w-2.5 ${style.checkColor}`} />
                              </div>
                              <span className="text-white/60 text-xs leading-relaxed">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <a
                        href="#contact"
                        className={`w-full flex items-center justify-center gap-2 ${style.btnClass} text-white py-3 rounded-xl font-bold text-sm transition-colors mt-2`}
                      >
                        Get Started <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-14">
              {["Starter Plan\n₹5,999", "Growth Plan\n₹9,999", "Pro Plan\n₹12,999", "Elite Plan\n₹19,999"].map((p, i) => (
                <div key={i} className={`rounded-2xl border ${PLAN_STYLES[i].border} bg-white/[0.02] p-6 animate-pulse`}>
                  <div className="h-6 bg-white/5 rounded mb-4 w-24" />
                  <div className="h-10 bg-white/5 rounded mb-6 w-32" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => <div key={j} className="h-3 bg-white/5 rounded w-full" />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-white/30 text-sm">Not sure which plan is right for you?</p>
            <a href="#contact" className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
              Get a free consultation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">Why Choose Prime Link?</h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                We don't just run campaigns — we build data-driven growth systems that compound over time.
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
      <section id="contact" className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Let's Talk Growth</h2>
            <p className="text-white/40 text-lg">Ready to dominate your local market? Get a free SEO audit today.</p>
          </div>
          <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/5 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Request received!</h3>
                <p className="text-white/40 text-sm mb-6">Our team will review your details and reach out shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAudit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your Name"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white"
                  />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email Address"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white"
                  />
                </div>
                <input
                  type="text"
                  value={form.business}
                  onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
                  placeholder="Your Business Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white mb-4"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone Number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white mb-4"
                />
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your business and goals..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 text-white mb-4 resize-none"
                />
                <button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createRequest.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Request Free Audit"
                  )}
                </button>
              </form>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 text-white/30 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />India</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-black text-white">PRIME LINK</span>
              <span className="font-black text-blue-500"> OS</span>
            </div>
            {footerPages && footerPages.length > 0 && (
              <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {footerPages.map((p) => (
                  <Link
                    key={p.id}
                    href={`/pages/${p.slug}`}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="border-t border-white/5 pt-6 text-center md:text-left">
            <p className="text-white/20 text-sm">© {new Date().getFullYear()} Prime Link. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
