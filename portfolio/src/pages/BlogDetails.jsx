import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { Calendar, User, Clock, ArrowLeft, Heart, Share2, MessageSquare, Send } from "lucide-react";
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
    content: `Many patients view flossing as a secondary hygiene chore. However, clinical research highlights that flossing BEFORE brushing makes a significant difference. When you floss first, you disrupt the organic biofilms and plaque situated between the teeth. Subsequently, brushing sweeps away these loose particulates, allowing the therapeutic fluoride in your toothpaste to access enamel crevices directly.

    To practice the Aurea Flossing Method:
    1. Cut a length of floss about 18 inches long. Wrap most of it around your middle fingers, leaving 2 inches to work with.
    2. Guide the string gently between your teeth. Never snap it into the gums.
    3. Curve the string into a 'C' shape against the side of the tooth, sliding it carefully under the gumline.
    4. Slide it up and down, pressing firmly. Repeat this on the adjacent tooth before moving forward.
    5. Roll the dirty floss to bring up a clean section, and continue.

    By flossing daily utilizing this sequence, you reduce interproximal plaque buildup by up to 80% compared to brushing alone.`,
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
    content: `Artificial Intelligence is rapidly shifting dentistry from reactive treatments to proactive prevention. Traditional bitewing X-rays are analyzed visually by clinicians who look for shadow gradients indicating enamel density loss. Unfortunately, minor early-stage decay can easily be overlooked.

    Incorporating deep learning neural networks changes this completely. At Aurea Dental, our diagnostic scanner integrates machine learning trained on millions of clinical cases. The algorithm processes pixel densities instantly on rendering, flagging anomalies and minor decay warnings with 98.7% diagnostic accuracy.

    Benefits of AI Diagnostics:
    - Early Detection: Catches decay at the sub-surface level, allowing us to remineralize enamel using calcium-phosphate treatments before a physical cavity breaks.
    - Consistency: Standardizes scan evaluations, ensuring no detail is overlooked regardless of visual glare.
    - Structural Profiling: Generates 3D structural reports mapping bite vectors so we can preempt orthodontic issues.

    With AI assisting our specialists, we identify dental issues long before they require drilling or fillings.`,
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
    content: `Clear aligner orthodontic treatments have gained huge popularity, but misunderstandings persist. Many believe aligners are exclusively aesthetic, or fail to resolve serious misalignments. Here, we address core aligner myths:

    Myth 1: 'Aligners are only for cosmetic straightening'
    Fact: While straight smiles are attractive, resolving crowding or overbites distributes pressure evenly across your jaw. This treats chronic temporomandibular joint (TMJ) friction and grinding.

    Myth 2: 'They are painful and take longer than braces'
    Fact: Aligners apply light, continuous forces. While you may feel minor tightness in the first 48 hours of shifting trays, overall discomfort is significantly lower than metal brackets.

    Myth 3: 'Any clear aligner is the same'
    Fact: Professional orthodontist-designed templates leverage customized medical-grade polyurethane. Retail mail-ordered kits skip key diagnostic checks, risking root resorption.

    Consulting a certified Aurea clinician ensures safety, rendering diagnostic stability throughout your orthodontic transformation.`,
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
    content: `Your oral environment is a battlefield of acid and pH balances. Every time you consume carbohydrates, bacteria in oral plaque generate lactic acid, dropping the pH below 5.5, which leaches minerals from your enamel.

    To actively defend your enamel, incorporate mineral-rich alkaline foods:
    - Hard Cheeses: Contain calcium and casein which bind to teeth, creating a protective barrier and neutralizing acids.
    - Leafy Greens: Require chewing, which stimulates saliva. Saliva is your body's natural defense mechanism, loaded with phosphate and calcium to remineralize enamel details.
    - Green Tea: Includes catechins that clear bacteria, reducing acidic outputs.

    Prioritizing these foods alongside alkaline water restores oral pH balance quickly, maintaining a strong decay shield.`,
  }
];

export default function BlogDetails() {
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

          {/* Meta Details */}
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
