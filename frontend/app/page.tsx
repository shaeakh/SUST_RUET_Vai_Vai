"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Search,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10 selection:text-primary">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/[0.05] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/[0.02] rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl"
      >
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/40 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-primary font-bold text-xl">
                C
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Catalyst<span className="text-primary text-sm ml-1">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-primary transition-colors"
            >
              Methodology
            </Link>
            <Link href="#docs" className="hover:text-primary transition-colors">
              Documentation
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="relative group px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </Link>
          </div>
        </nav>
      </motion.header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-40 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-md"
              >
                <Sparkles className="h-3 w-3" />
                <span>Next Generation AI Learning</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-6xl md:text-8xl leading-[0.95] text-slate-900"
                >
                  Master your courses <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/40">
                    with intelligence.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mx-auto max-w-2xl text-lg text-slate-500 md:text-xl font-light leading-relaxed"
                >
                  The AI-powered supplementary platform that organizes theory,
                  masters lab codes, and generates validated learning materials
                  in seconds.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
              >
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_10px_40px_rgba(255,0,0,0.15)] hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Learning Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all font-semibold rounded-xl flex items-center justify-center gap-2 text-slate-900"
                >
                  Explore Dashboard
                </Link>
              </motion.div>

              {/* Status Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="pt-12 flex items-center justify-center gap-8 text-[10px] uppercase tracking-[0.2em] text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  RAG-Engine Online
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
                  System Optimized
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          id="features"
          className="px-6 py-24 lg:px-12 bg-slate-50/50 border-y border-slate-200"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Theory & Lab CMS"
                description="Organize lecture slides, PDFs, and code repositories in a unified, syntax-aware environment designed for academics."
                delay={0.1}
              />
              <FeatureCard
                icon={<Search className="h-6 w-6" />}
                title="Semantic Retrieval"
                description="RAG-based search engine that understands context. Find that specific code snippet or theoretical concept instantly."
                delay={0.2}
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="AI Material Generation"
                description="Generate structured reading notes and syntactically correct lab materials grounded in your course data."
                delay={0.3}
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Automated Validation"
                description="Inbuilt linting, syntax checking, and reference grounding to ensure all AI-generated content is reliable."
                delay={0.4}
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6" />}
                title="Conversational AI"
                description="Ask questions, request summaries, and interact with your course materials through a seamless chat interface."
                delay={0.5}
              />
              <FeatureCard
                icon={<Code2 className="h-6 w-6" />}
                title="Developer Friendly"
                description="Support for multiple programming languages with structure-aware search for complex lab materials."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-6 py-32 lg:px-12 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/[0.08] blur-[150px] -z-10 rounded-full" />
          <div className="mx-auto max-w-4xl text-center space-y-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
              Ready to evolve your <br />
              <span className="text-primary italic">learning experience?</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-light">
              Join the future of university education. Upload your materials and
              watch Catalyst turn them into a structured digital second brain.
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                Join the Platform
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-12 px-6 lg:px-12 bg-slate-50">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
              C
            </div>
            <span className="font-bold tracking-tighter text-slate-900">
              CATALYST <span className="text-slate-400">AI</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} Catalyst Learning Systems. Built for
            Excellence.
          </p>
          <div className="flex gap-6 text-slate-500 hover:text-slate-900 transition-colors text-xs font-medium">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="group relative p-8 rounded-2xl bg-white border border-slate-200/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all"
    >
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-primary group-hover:scale-110 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-light">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-xs font-bold uppercase tracking-widest">
        Learn more <ArrowRight className="h-3 w-3" />
      </div>
    </motion.div>
  );
}
