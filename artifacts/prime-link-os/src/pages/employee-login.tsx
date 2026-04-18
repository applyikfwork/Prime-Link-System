import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries();
          const role = data.user.role;
          if (role === "salesman") {
            setLocation("/salesman");
          } else if (role === "worker") {
            setLocation("/worker");
          } else {
            setError("Admin accounts must use the admin login portal.");
          }
        },
        onError: () => {
          setError("Invalid credentials. Please check your email and password.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            PRIME LINK <span className="text-blue-500">OS</span>
          </h1>
          <p className="text-white/30 text-sm">Employee Portal</p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-1">Employee Sign In</h2>
          <p className="text-white/30 text-xs mb-6">Use the credentials provided by your administrator.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] placeholder:text-white/20 transition-colors"
                placeholder="you@primelink.io"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] placeholder:text-white/20 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-colors mt-2"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In to Portal"}
            </button>
          </form>
        </div>
        <p className="text-center text-white/10 text-xs mt-6">Contact your admin if you've lost access.</p>
      </div>
    </div>
  );
}
