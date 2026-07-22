import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";

export const blogPosts = [
  {
    slug: "perfect-flossing-method",
    title: "The Atelier Flossing Method: What You Missed",
    date: "July 12, 2026",
    author: "Dr. Catherine Reyes",
    category: "Dental Tips",
    summary: "Flossing before brushing is standard practice, but how you angle the string makes all the difference for your gums.",
    readTime: "4 min read",
    img: gallery1,
    featured: true,
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
    featured: false,
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
    featured: false,
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
    featured: false,
    content: `Your oral environment is a battlefield of acid and pH balances. Every time you consume carbohydrates, bacteria in oral plaque generate lactic acid, dropping the pH below 5.5, which leaches minerals from your enamel.

    To actively defend your enamel, incorporate mineral-rich alkaline foods:
    - Hard Cheeses: Contain calcium and casein which bind to teeth, creating a protective barrier and neutralizing acids.
    - Leafy Greens: Require chewing, which stimulates saliva. Saliva is your body's natural defense mechanism, loaded with phosphate and calcium to remineralize enamel details.
    - Green Tea: Includes catechins that clear bacteria, reducing acidic outputs.

    Prioritizing these foods alongside alkaline water restores oral pH balance quickly, maintaining a strong decay shield.`,
  }
];

export const blogCategories = ["All", "Dental Tips", "Technology", "Orthodontics"];
