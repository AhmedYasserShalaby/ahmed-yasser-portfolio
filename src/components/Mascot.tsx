import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import guideCelebrate from "../../assets/dragon-guide/guide-celebrate.png";
import guideIdle from "../../assets/dragon-guide/guide-idle.png";
import guidePoint from "../../assets/dragon-guide/guide-point.png";
import guidePower from "../../assets/dragon-guide/guide-power.png";
import guideWave from "../../assets/dragon-guide/guide-wave.png";
import worldBeerus from "../../assets/dragon-guide/world-beerus.png";
import worldEarth from "../../assets/dragon-guide/world-earth.png";
import worldKai from "../../assets/dragon-guide/world-king-kai.png";
import worldNamek from "../../assets/dragon-guide/world-namek.png";
import worldSupremeKai from "../../assets/dragon-guide/world-supreme-kai.png";
import worldVegeta from "../../assets/dragon-guide/world-vegeta.png";
import worldYardrat from "../../assets/dragon-guide/world-yardrat.png";
import { useActiveSection } from "../hooks/useActiveSection";
import { useReducedMotion } from "../hooks/useReducedMotion";

type Pose = "idle" | "wave" | "point" | "power" | "celebrate";

type DragonTarget =
  | {
      id: string;
      label: string;
      image: string;
      kind: "nav";
      section: "hey" | "about" | "work" | "contact";
      line: string;
    }
  | {
      id: string;
      label: string;
      image: string;
      kind: "power";
      action: "project" | "resume" | "contact";
      line: string;
    };

const poseImages: Record<Pose, string> = {
  idle: guideIdle,
  wave: guideWave,
  point: guidePoint,
  power: guidePower,
  celebrate: guideCelebrate
};

const sectionLines: Record<string, string> = {
  hey: "Landing detected. Ahmed turns messy problems into working systems.",
  about: "Quiet builder energy. Structure first, polish second.",
  work: "This is not screenshot theater. These systems actually run.",
  contact: "Good timing. He actually answers email."
};

const targets: DragonTarget[] = [
  {
    id: "earth",
    label: "Earth",
    image: worldEarth,
    kind: "nav",
    section: "hey",
    line: sectionLines.hey
  },
  {
    id: "namek",
    label: "Namek",
    image: worldNamek,
    kind: "nav",
    section: "about",
    line: sectionLines.about
  },
  {
    id: "planet-vegeta",
    label: "Planet Vegeta",
    image: worldVegeta,
    kind: "nav",
    section: "work",
    line: sectionLines.work
  },
  {
    id: "king-kai",
    label: "King Kai",
    image: worldKai,
    kind: "nav",
    section: "contact",
    line: sectionLines.contact
  },
  {
    id: "yardrat",
    label: "Yardrat",
    image: worldYardrat,
    kind: "power",
    action: "project",
    line: "Instant transmission to the strongest data platform proof."
  },
  {
    id: "beerus",
    label: "Beerus",
    image: worldBeerus,
    kind: "power",
    action: "resume",
    line: "Quick scan: data engineering, analytics, cloud security, real builds."
  },
  {
    id: "supreme-kai",
    label: "Supreme Kai",
    image: worldSupremeKai,
    kind: "power",
    action: "contact",
    line: "Summoning contact mode. Clean shot, no filler arc."
  }
];

const resumeFacts = ["Business Informatics", "Data Engineering", "Analytics Engineering", "Cloud Security"];

function setCursorHint(active: boolean, label = "JUMP") {
  window.dispatchEvent(new CustomEvent("ringHover", { detail: { active, label } }));
}

function focusContact() {
  const contact = document.getElementById("contact");
  const email = contact?.querySelector(".email-link");

  contact?.classList.add("dragon-contact-focus");
  email?.classList.add("dragon-email-focus");

  window.setTimeout(() => {
    contact?.classList.remove("dragon-contact-focus");
    email?.classList.remove("dragon-email-focus");
  }, 3600);
}

export function Mascot() {
  const activeSection = useActiveSection();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [hoveredTarget, setHoveredTarget] = useState<DragonTarget | null>(null);
  const [actionPose, setActionPose] = useState<Pose | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const poseTimeoutRef = useRef<number | null>(null);

  const activeTargetId = useMemo(() => {
    const sectionTarget = targets.find((target) => target.kind === "nav" && target.section === activeSection);
    return sectionTarget?.id ?? "earth";
  }, [activeSection]);

  useEffect(() => {
    setPortalRoot(document.body);

    return () => {
      if (poseTimeoutRef.current !== null) {
        window.clearTimeout(poseTimeoutRef.current);
      }
      setCursorHint(false);
    };
  }, []);

  function flashPose(pose: Pose, duration = 1500) {
    if (poseTimeoutRef.current !== null) {
      window.clearTimeout(poseTimeoutRef.current);
    }
    setActionPose(pose);
    poseTimeoutRef.current = window.setTimeout(() => {
      setActionPose(null);
      poseTimeoutRef.current = null;
    }, reducedMotion ? 250 : duration);
  }

  function jumpTo(section: DragonTarget & { kind: "nav" }) {
    setResumeOpen(false);
    flashPose(section.section === "contact" ? "wave" : "point");
    navigate({ pathname: "/", hash: `#${section.section}` });
  }

  function triggerPower(target: DragonTarget & { kind: "power" }) {
    flashPose(target.action === "project" ? "power" : "celebrate", 1900);

    if (target.action === "project") {
      setResumeOpen(false);
      navigate({ pathname: "/", hash: "#work" });
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("dragonGuideBoostProject", {
            detail: { slug: "ecommerce-cloud-data-platform" }
          })
        );
      }, 120);
      return;
    }

    if (target.action === "resume") {
      setResumeOpen((current) => !current);
      return;
    }

    setResumeOpen(false);
    navigate({ pathname: "/", hash: "#contact" });
    window.setTimeout(focusContact, 180);
  }

  function handleTargetClick(target: DragonTarget) {
    if (target.kind === "nav") {
      jumpTo(target);
    } else {
      triggerPower(target);
    }
  }

  const hoverPose: Pose | null = hoveredTarget ? (hoveredTarget.kind === "nav" ? "point" : "power") : null;
  const pose = actionPose ?? hoverPose ?? (activeSection === "contact" ? "wave" : "idle");
  const line = resumeOpen
    ? "Resume radar: technical projects, clean proof, and no spreadsheet cosplay."
    : hoveredTarget?.line ?? sectionLines[activeSection] ?? sectionLines.hey;
  const shellClass = `${activeSection === "hey" ? "is-hero" : "is-sticky"} ${reducedMotion ? "is-reduced" : ""}`;

  function renderTargetButton(target: DragonTarget, index: number, mode: "desktop" | "mobile") {
    return (
      <button
        key={`${mode}-${target.id}`}
        type="button"
        className={`dragon-target dragon-${mode}-target ${target.kind === "power" ? "is-power" : "is-nav"} ${
          target.id === activeTargetId ? "is-active" : ""
        }`}
        style={{ "--dragon-index": index } as CSSProperties & Record<"--dragon-index", number>}
        data-dragon-target={target.id}
        onClick={() => handleTargetClick(target)}
        onFocus={() => {
          setHoveredTarget(target);
          setCursorHint(true, target.kind === "nav" ? "JUMP" : "POWER");
        }}
        onBlur={() => {
          setHoveredTarget(null);
          setCursorHint(false);
        }}
        onMouseEnter={() => {
          setHoveredTarget(target);
          setCursorHint(true, target.kind === "nav" ? "JUMP" : "POWER");
        }}
        onMouseLeave={() => {
          setHoveredTarget(null);
          setCursorHint(false);
        }}
        aria-label={`${target.kind === "nav" ? "Jump to" : "Activate"} ${target.label}`}
      >
        <img src={target.image} alt="" draggable="false" />
        <span>{target.label}</span>
      </button>
    );
  }

  const desktopTargetLayer = (
    <div className={`dragon-target-layer ${shellClass}`}>
      <div className="dragon-targets" aria-label="Dragon Ball world navigation">
        {targets.map((target, index) => renderTargetButton(target, index, "desktop"))}
      </div>
    </div>
  );

  const mobileTargetLayer = (
    <>
      <div className={`dragon-mobile-dock ${shellClass}`} aria-hidden="true" />
      {targets.map((target, index) => renderTargetButton(target, index, "mobile"))}
    </>
  );

  return (
    <>
      <aside
        className={`dragon-guide ${shellClass}`}
        data-testid="dragon-guide"
        aria-label="DragonGuide portfolio navigator"
      >
        <div className="dragon-guide-stage">
          <div className="dragon-speech" aria-live="polite">
            {line}
          </div>

          {resumeOpen ? (
            <div className="dragon-proof-panel" data-testid="dragon-proof-panel">
              {resumeFacts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          ) : null}

          <img className={`dragon-sprite pose-${pose}`} src={poseImages[pose]} alt="" draggable="false" />
        </div>
      </aside>
      {desktopTargetLayer}
      {portalRoot ? createPortal(mobileTargetLayer, portalRoot) : mobileTargetLayer}
    </>
  );
}
