import { useCallback, useEffect, useRef, useState } from "react";
import guideIdle from "../../assets/dragon-guide/guide-idle.png";
import guideWave from "../../assets/dragon-guide/guide-wave.png";
import guidePoint from "../../assets/dragon-guide/guide-point.png";
import guidePower from "../../assets/dragon-guide/guide-power.png";
import guideCelebrate from "../../assets/dragon-guide/guide-celebrate.png";
import { useActiveSection } from "../hooks/useActiveSection";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Pose = "idle" | "wave" | "point" | "power" | "celebrate";

const poseImages: Record<Pose, string> = {
  idle: guideIdle,
  wave: guideWave,
  point: guidePoint,
  power: guidePower,
  celebrate: guideCelebrate,
};

const sectionCommentary: Record<string, string[]> = {
  hey: [
    "You just landed. This guy turns messy problems into working systems.",
    "Welcome! Ahmed builds things that actually work. Wild concept, right?",
    "First impression zone. Try not to scroll too fast — I get dizzy.",
  ],
  about: [
    "Quiet builder energy. Structure first, polish second.",
    "Business Informatics student. Yes, that's a real thing.",
    "He likes the work before the shiny screenshot. Weird flex, but OK.",
  ],
  work: [
    "These projects actually run. Not screenshot theater.",
    "Real data pipelines, real dashboards, real tests. No cap.",
    "Each project here was built solo. Respect the grind.",
  ],
  contact: [
    "Good timing — he actually answers email.",
    "End of the page. Time to send that message!",
    "You scrolled all the way down. That's dedication. Hire him.",
  ],
};

const funnyQuotes = [
  "I'm not afraid of you! … OK maybe a little.",
  "Power level? Over 9000. Coding level? We're getting there.",
  "KAMEHAME... wait, wrong context.",
  "I'm just here so I don't get fined.",
  "You pressed me again? I'm not a button! … well, technically…",
  "Senzu bean break! 🫘",
  "This isn't even my final form! Oh wait, wrong character.",
  "If I train hard enough, maybe I can learn TypeScript.",
  "I could eat a whole buffet right now.",
  "Don't tell Vegeta I'm slacking off on this portfolio.",
];

const superSaiyanLines = [
  "HAAAAAAA!! ⚡️ … sorry, got carried away.",
  "This is what peak performance looks like. Allegedly.",
  "Super Saiyan mode: ACTIVATED. Hair gel budget: DESTROYED.",
  "I can feel the power! And also the CSS transitions!",
];

export function GokuCompanion() {
  const activeSection = useActiveSection();
  const reducedMotion = useReducedMotion();
  const [pose, setPose] = useState<Pose>("idle");
  const [speech, setSpeech] = useState("");
  const [isSuperSaiyan, setIsSuperSaiyan] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [showSpeech, setShowSpeech] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  const poseTimeoutRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const fallTimeoutRef = useRef<number | null>(null);
  const sectionIndexRef = useRef<Record<string, number>>({});
  const isMountedRef = useRef(false);

  // Set section-aware commentary
  useEffect(() => {
    const lines = sectionCommentary[activeSection] ?? sectionCommentary.hey;
    const idx = sectionIndexRef.current[activeSection] ?? 0;
    const line = lines[idx % lines.length];
    sectionIndexRef.current[activeSection] = idx + 1;

    setSpeech(line);
    setShowSpeech(true);

    // Auto-hide speech after 6s
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = window.setTimeout(() => {
      setShowSpeech(false);
    }, 6000);

    // Wave when arriving at a new section (not on mount)
    if (isMountedRef.current && !isSuperSaiyan) {
      flashPose("wave", 1200);
    }
    isMountedRef.current = true;

    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Scroll-triggered falling
  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        scrollVelocityRef.current = delta;
        lastScrollYRef.current = currentY;

        // Fall when scrolling down fast
        if (delta > 60 && !isFalling) {
          setIsFalling(true);

          if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
          fallTimeoutRef.current = window.setTimeout(() => {
            setIsFalling(false);
          }, 800);
        }

        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
    };
  }, [reducedMotion, isFalling]);

  const flashPose = useCallback(
    (p: Pose, duration = 1500) => {
      if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);
      setPose(p);
      poseTimeoutRef.current = window.setTimeout(
        () => {
          setPose("idle");
          poseTimeoutRef.current = null;
        },
        reducedMotion ? 300 : duration,
      );
    },
    [reducedMotion],
  );

  function handleClick() {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    // Cycle: super saiyan → funny quote → celebrate → repeat
    const phase = nextCount % 3;

    if (phase === 1) {
      // Super Saiyan!
      setIsSuperSaiyan(true);
      flashPose("power", 2500);
      const line =
        superSaiyanLines[Math.floor(Math.random() * superSaiyanLines.length)];
      setSpeech(line);
      setShowSpeech(true);

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = window.setTimeout(() => {
        setIsSuperSaiyan(false);
        setShowSpeech(false);
      }, 2500);
    } else if (phase === 2) {
      // Funny quote
      flashPose("point", 2000);
      const line =
        funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
      setSpeech(line);
      setShowSpeech(true);

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = window.setTimeout(() => {
        setShowSpeech(false);
      }, 3000);
    } else {
      // Celebrate
      flashPose("celebrate", 1800);
      setSpeech("🎉 You found the secret interaction!");
      setShowSpeech(true);

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = window.setTimeout(() => {
        setShowSpeech(false);
      }, 2500);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
    };
  }, []);

  const containerClass = [
    "goku-companion",
    isSuperSaiyan ? "is-super-saiyan" : "",
    isFalling ? "is-falling" : "",
    reducedMotion ? "is-reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside
      className={containerClass}
      aria-label="Goku companion"
      data-testid="goku-companion"
    >
      {/* Speech bubble */}
      <div className={`goku-speech ${showSpeech ? "is-visible" : ""}`}>
        {speech}
      </div>

      {/* Aura effect for super saiyan */}
      {isSuperSaiyan && <div className="goku-aura" />}

      {/* Goku sprite */}
      <button
        type="button"
        className={`goku-sprite-btn pose-${pose}`}
        onClick={handleClick}
        aria-label="Interact with Goku"
      >
        <img
          className="goku-sprite"
          src={poseImages[pose]}
          alt=""
          draggable="false"
        />
      </button>
    </aside>
  );
}
