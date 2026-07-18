import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Search, Calendar, User, Clock, ArrowRight, BookOpen } from "lucide-react";
import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";

const blogPosts = [
  {
    slug: "perfect-flossing-method",
    title: "The Atelier Flossing Method: What You Missed",
    date: "July 12, 2026",
    author: "Dr. Catherine Reyes",
    category: "Dental Tips",
    summary: "Flossing before brushing is standard practice, but how you angle the string makes all the difference for your gums.",
    readTime: "4 min read",
    img: gallery1,
    featured: true
  },
  {
    slug: "ai-in-dentistry",
    title: "How AI Diagnostic Tools Identify Early Decay",
    date: "June 28, 2026",
    author: "Dr. Marcus Vance",
    category: "Technology",
    summary: "Panoramic scans combined with machine learning models detect sub-surface decay years before visual diagnostics can.",
    readTime: "6 min read",
    img: gallery2,
    featured: false
  },
  {
    slug: "invisalign-myths",
    title: "5 Myths About Clear Aligners Debunked",
    date: "June 15, 2026",
    author: "Dr. Sarah Kim",
    category: "Orthodontics",
    summary: "Invisible aligners are not just for cosmetic adjustments; they prevent long-term grinding jaw stress too.",
    readTime: "5 min read",
    img: gallery3,
    featured: false
  },
  {
    slug: "diet-enamel-health",
    title: "Acids vs. Enamel: Food that Safeguards Teeth",
    date: "May 20, 2026",
    author: "Dr. Catherine Reyes",
    category: "Dental Tips",
    summary: "Certain alkaline foods rebuild saliva minerals and strengthen your protective enamel shield against cavities naturally.",
    readTime: "3 min read",
    img: gallery1,
    featured: false
  }
];

const categories = ["All", "Dental Tips", "Technology", "Orthodontics"];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = blogPosts.filter(post => {
    const matchCat = activeCat === "All" || post.category === activeCat;
    const matchSearch = !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredPost = blogPosts.find(p => p.featured);

  return (
    <div className="bg-background">
      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Aurea Dental Journal
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl tracking-tight text-secondary">
              Scientific advice for<br />
              <span className="text-gradient-primary">healthy daily lifestyles.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Search & Filter Row ── */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="flex items-center gap-3 rounded-full border border-border bg-white px-5 py-3 shadow-sm w-full md:max-w-md">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-transparent text-sm outline-none text-secondary"
              />
            </div>
            {/* Tabs */}
            <div className="flex flex-wrap lg:justify-end gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                    activeCat === cat
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Post Banner ── */}
      {!search && activeCat === "All" && featuredPost && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <Reveal>
              <div className="group rounded-[32px] overflow-hidden border border-border bg-white soft-shadow grid lg:grid-cols-12 gap-8 p-6 lg:p-10 hover:shadow-[0_20px_50px_-15px_rgba(31,138,112,0.15)] transition-shadow duration-300">
                {/* Photo */}
                <div className="lg:col-span-5 h-[300px] lg:h-full rounded-2xl overflow-hidden bg-muted relative">
                  <img src={featuredPost.img} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent" />
                </div>
                {/* Text details */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-primary">Featured Article</span>
                  <h2 className="mt-3 font-display text-2xl lg:text-3xl font-bold text-secondary leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-xs lg:text-sm text-muted-foreground leading-relaxed">
                    {featuredPost.summary}
                  </p>
                  
                  {/* Meta items */}
                  <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-neutral-50 pt-5">
                    <span className="flex items-center gap-1"><User className="size-3.5" /> {featuredPost.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {featuredPost.date}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {featuredPost.readTime}</span>
                  </div>

                  <div className="mt-6">
                    <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all cursor-pointer">
                      Read full column <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Latest Articles Grid ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="size-5 text-primary" />
            <h3 className="font-display text-xl font-bold text-secondary">Latest Columns</h3>
          </div>
          {filtered.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {filtered.map(post => (
                <motion.article
                  variants={staggerItem}
                  key={post.slug}
                  className="group rounded-[28px] overflow-hidden bg-white border border-border soft-shadow hover:shadow-lg transition-transform duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-4 left-4 glass text-[10px] font-bold px-2.5 py-1 rounded-full text-secondary border border-white/20">
                        {post.category}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="p-6">
                      <div className="flex gap-4 text-[10px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {post.readTime}</span>
                      </div>
                      <h4 className="font-display font-bold text-lg text-secondary leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 border-t border-neutral-50 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-secondary">{post.author}</span>
                    <Link to={`/blog/${post.slug}`} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                      Read article
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="size-12 text-primary/30 mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-secondary">No articles found</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); }} className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
