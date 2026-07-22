import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { Calendar, User, Clock, ArrowLeft, Heart, Share2, MessageSquare, Send } from "lucide-react";
import { blogPosts } from "./data";

export function BlogDetailView() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([
    { author: "Michael D.", date: "1 day ago", text: "Truly helpful method! I started flossing before brushing this week, and my mouth feels noticeably cleaner already." },
    { author: "Elena R.", date: "3 days ago", text: "Great suggestions. Could you clarify if electric flossing tools are as effective as string?" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(32);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const match = blogPosts.find(p => p.slug === slug);
    setPost(match || blogPosts[0]);
  }, [slug]);

  if (!post) return null;

  const related = blogPosts.filter(p => p.slug !== post.slug).slice(0, 2);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      { author: "Guest User", date: "Just now", text: newComment.trim() }
    ]);
    setNewComment("");
  };

  const handleLike = () => {
    if (liked) {
      setLikes(l => l - 1);
      setLiked(false);
    } else {
      setLikes(l => l + 1);
      setLiked(true);
    }
  };

  return (
    <div className="bg-background pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-5 md:px-8">

        {/* Back Link */}
        <Reveal>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="size-4" /> Back to journal
          </Link>
        </Reveal>

        {/* ── Article Header ── */}
        <header className="mb-10 text-secondary">
          <Reveal>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent text-primary border border-primary/10">
              {post.category}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              {post.title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              {post.summary}
            </p>
          </Reveal>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-y border-border py-4 my-6">
            <span className="flex items-center gap-1.5"><User className="size-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" /> {post.readTime}</span>
          </div>
        </header>

        {/* ── Featured Image ── */}
        <div className="rounded-[32px] overflow-hidden aspect-[16/9] mb-10 border border-border shadow-sm bg-muted relative">
          <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* ── Rich Content Layout ── */}
        <article className="prose prose-neutral max-w-none text-secondary">
          <div className="text-sm md:text-base leading-relaxed space-y-6 text-secondary/90 font-sans">
            {post.content.split("\n\n").map((para, i) => (
              <p key={i} className="whitespace-pre-line leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </article>

        {/* ── Social Share & Like Buttons ── */}
        <div className="flex items-center justify-between border-y border-border py-6 my-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-colors cursor-pointer ${
                liked ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-border hover:bg-neutral-50"
              }`}
            >
              <Heart className={`size-4 ${liked ? "fill-primary-foreground" : ""}`} /> {likes} Likes
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-border bg-white text-muted-foreground hover:bg-neutral-50 transition-colors cursor-pointer">
              <Share2 className="size-4" /> Share Article
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Aurea Clinic Press</span>
        </div>

        {/* ── Comments Section ── */}
        <section className="mb-14">
          <h3 className="font-display text-xl font-bold text-secondary mb-6 flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" /> Patient Discussions ({comments.length})
          </h3>
          <div className="space-y-4 mb-8">
            {comments.map((c, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-border soft-shadow">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-secondary">{c.author}</span>
                  <span>{c.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-end">
            <div className="flex-1 bg-white rounded-2xl border border-border p-3 shadow-sm">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                className="w-full bg-transparent text-sm min-h-[80px] outline-none text-secondary resize-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="grid place-items-center size-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 transition-transform duration-200 hover:scale-105 shrink-0 cursor-pointer shadow-md shadow-primary/20"
              aria-label="Submit comment"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>

        {/* ── Related Articles ── */}
        <section className="border-t border-border pt-12">
          <h3 className="font-display text-lg font-bold text-secondary mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map(rPost => (
              <article key={rPost.slug} className="group rounded-2xl overflow-hidden bg-white border border-border soft-shadow flex flex-col justify-between">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img src={rPost.img} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h4 className="font-display font-semibold text-sm text-secondary leading-snug group-hover:text-primary transition-colors">
                    {rPost.title}
                  </h4>
                  <Link to={`/blog/${rPost.slug}`} className="text-xs font-bold text-primary hover:underline mt-4 cursor-pointer block">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
