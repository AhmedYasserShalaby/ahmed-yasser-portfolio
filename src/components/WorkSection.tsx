import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { type Project, type ProjectImage, projects } from "../data/projects";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ProjectLinks } from "./ProjectLinks";

const HOVER_PREVIEW_INTERVAL_MS = 3000;

type TransitionState = {
  project: Project;
  bounds: DOMRect;
};

type PreviewSource = "focus" | "pointer" | null;

function targetIsLink(eventTarget: EventTarget | null) {
  return eventTarget instanceof Element && Boolean(eventTarget.closest("a"));
}

function getProjectPreviewFrames(project: Project): ProjectImage[] {
  if (project.hoverGallery?.length) {
    return project.hoverGallery;
  }

  if (project.gallery?.length) {
    return project.gallery;
  }

  return [
    {
      src: project.previewImage,
      alt: "",
      caption: "",
      fit: project.previewFit,
      tone: project.previewTone,
      frame: project.previewFrame
    }
  ];
}

function previewClassName(preview?: Pick<ProjectImage, "fit" | "tone" | "frame">) {
  return [
    preview?.fit === "contain" ? "fit-contain" : "",
    `tone-${preview?.tone ?? "light"}`,
    preview?.frame === "phone" ? "frame-phone" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function WorkSection() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const [boostedProjectSlug, setBoostedProjectSlug] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const transitionRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dummyTargetRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const desktopHover = useMediaQuery("(hover: hover) and (min-width: 900px)");
  const activePreviewFrames = activeProject ? getProjectPreviewFrames(activeProject) : [];
  const activePreview = activePreviewFrames[activePreviewIndex] ?? activePreviewFrames[0];
  const shouldRotatePreview = Boolean(
    activeProject &&
      previewSource === "pointer" &&
      desktopHover &&
      !reducedMotion &&
      !transition &&
      activePreviewFrames.length > 1
  );

  useEffect(() => {
    let clearBoostTimeout: ReturnType<typeof setTimeout> | null = null;

    function onBoostProject(event: Event) {
      const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
      const project = projects.find((item) => item.slug === slug);

      if (!project) {
        return;
      }

      setBoostedProjectSlug(project.slug);

      window.setTimeout(() => {
        document.querySelector(`[data-project-slug="${project.slug}"]`)?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center"
        });
      }, 80);

      if (clearBoostTimeout) {
        clearTimeout(clearBoostTimeout);
      }
      clearBoostTimeout = setTimeout(() => setBoostedProjectSlug(null), 4600);
    }

    window.addEventListener("dragonGuideBoostProject", onBoostProject);
    return () => {
      window.removeEventListener("dragonGuideBoostProject", onBoostProject);
      if (clearBoostTimeout) {
        clearTimeout(clearBoostTimeout);
      }
    };
  }, [reducedMotion]);

  // Debounce the project change
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hoveredProject === activeProject) return;
    timeoutRef.current = setTimeout(() => {
      setActiveProject(hoveredProject);
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hoveredProject, activeProject]);

  useEffect(() => {
    setActivePreviewIndex(0);
  }, [activeProject?.slug]);

  useEffect(() => {
    if (!shouldRotatePreview || !activeProject) {
      return;
    }

    const frameCount = getProjectPreviewFrames(activeProject).length;
    const intervalId = window.setInterval(() => {
      setActivePreviewIndex((current) => (current + 1) % frameCount);
    }, HOVER_PREVIEW_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeProject, shouldRotatePreview]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !desktopHover || reducedMotion) {
      return;
    }

    const previewElement = preview;
    const xTo = gsap.quickTo(previewElement, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(previewElement, "y", { duration: 0.55, ease: "power3.out" });
    const viewportPadding = 24;

    function onMove(event: PointerEvent) {
      const rect = previewElement.getBoundingClientRect();
      const preferredX = event.clientX + 34;
      const preferredY = event.clientY - Math.min(210, rect.height * 0.34);
      const maxX = Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding);
      const maxY = Math.max(viewportPadding, window.innerHeight - rect.height - viewportPadding);
      const nextX = Math.min(Math.max(preferredX, viewportPadding), maxX);
      const nextY = Math.min(Math.max(preferredY, viewportPadding), maxY);

      xTo(nextX);
      yTo(nextY);
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [desktopHover, reducedMotion]);

  useEffect(() => {
    if (!previewRef.current || reducedMotion) {
      return;
    }

    if (transition) {
      gsap.set(previewRef.current, { autoAlpha: 0, scale: 0.96 });
      return;
    }

    gsap.to(previewRef.current, {
      autoAlpha: activeProject ? 1 : 0,
      scale: activeProject ? 1 : 0.96,
      duration: 0.6,
      ease: "power2.inOut"
    });
  }, [activeProject, reducedMotion, transition]);

  useEffect(() => {
    const element = transitionRef.current;
    const overlay = overlayRef.current;
    const dummyTarget = dummyTargetRef.current;
    const list = listRef.current;
    const header = document.querySelector(".site-header");
    
    if (!element || !overlay || !dummyTarget || !transition || !list) {
      return;
    }

    const startBounds = transition.bounds;
    const targetBounds = dummyTarget.getBoundingClientRect();

    const tl = gsap.timeline({
      onComplete: () => {
        navigate(`/projects/${transition.project.slug}`);
      }
    });

    // Set card to match preview position
    gsap.set(element, {
      left: startBounds.left,
      top: startBounds.top,
      width: startBounds.width,
      height: startBounds.height,
      autoAlpha: 1,
      borderRadius: "4px"
    });

    gsap.set(overlay, { autoAlpha: 0 });

    // Phase 1: Fade out surrounding UI with subtle upward slide
    tl.to([list, header, ".section-heading"], {
      autoAlpha: 0,
      y: -40,
      duration: 0.5,
      ease: "power3.in",
      stagger: 0.04
    }, 0);

    // Phase 2: Expand card smoothly to the target visual's bounds
    tl.to(element, {
      left: targetBounds.left,
      top: targetBounds.top,
      width: targetBounds.width,
      height: targetBounds.height,
      borderRadius: "0px",
      duration: 0.8,
      ease: "power3.inOut"
    }, 0.1);

    // Phase 3: Background dims
    tl.to(".data-field", {
      autoAlpha: 0,
      duration: 0.5,
      ease: "power2.inOut"
    }, 0);

    // Phase 4: Clean overlay fade in
    tl.to(overlay, {
      autoAlpha: 1,
      duration: 0.35,
      ease: "power2.in"
    }, 0.6);

    return () => {
      tl.kill();
    };
  }, [navigate, transition]);

  function openProject(project: Project, eventTarget: EventTarget | null) {
    if (targetIsLink(eventTarget)) {
      return;
    }

    if (!desktopHover || reducedMotion || !previewRef.current) {
      navigate(`/projects/${project.slug}`);
      return;
    }

    const bounds = previewRef.current.getBoundingClientRect();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    gsap.set(previewRef.current, { autoAlpha: 0, scale: 0.96 });
    setHoveredProject(null);
    setActiveProject(null);
    setTransition({ project, bounds });
  }

  function onRowKeyDown(project: Project, event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(project, event.target);
    }
  }

  return (
    <section ref={sectionRef} className="work" id="work" aria-labelledby="work-title">
      <div className="section-heading reveal">
        <p>03/Work</p>
        <h2 id="work-title">Selected systems</h2>
      </div>

      <div
        ref={listRef}
        className="work-list"
        onMouseLeave={() => {
          setHoveredProject(null);
          setPreviewSource(null);
        }}
      >
        {projects.map((project) => (
          <article
            key={project.slug}
            className={`work-row accent-${project.accent} ${project.secondary ? "secondary" : ""} ${
              boostedProjectSlug === project.slug ? "dragon-boost" : ""
            }`}
            data-project-slug={project.slug}
            role="link"
            tabIndex={0}
            onClick={(event: MouseEvent<HTMLElement>) => openProject(project, event.target)}
            onFocus={() => {
              setHoveredProject(project);
              setPreviewSource("focus");
            }}
            onMouseEnter={() => {
              setHoveredProject(project);
              setPreviewSource("pointer");
            }}
            onKeyDown={(event) => onRowKeyDown(project, event)}
          >
            <div className="work-title">
              <span>{project.number}</span>
              <h3>{project.shortTitle}</h3>
            </div>
            <p>{project.stack.join("/")}</p>
            <p>{project.summary}</p>
            <ProjectLinks project={project} compact />
            <img
              className={`work-mobile-preview ${previewClassName(getProjectPreviewFrames(project)[0])}`}
              src={project.previewImage}
              alt=""
              loading="lazy"
            />
            <div className="line-reveal" />
          </article>
        ))}
      </div>

      <div
        ref={previewRef}
        className={`work-preview ${activeProject ? `accent-${activeProject.accent}` : ""} ${previewClassName(activePreview)}`}
        aria-hidden="true"
      >
        {activeProject && (
          <>
            <img src={activePreview?.src ?? activeProject.previewImage} alt="" />
            {shouldRotatePreview ? (
              <div className="work-preview-progress" role="presentation">
                <div
                  key={`${activeProject.slug}-${activePreviewIndex}`}
                  className="work-preview-progress-fill"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {transition && (
        <>
          <div
            ref={transitionRef}
            className={`project-transition-card ${previewClassName(getProjectPreviewFrames(transition.project)[0])}`}
            aria-hidden="true"
          >
            <img src={transition.project.previewImage} alt="" />
          </div>
          <div ref={overlayRef} className="project-transition-overlay" aria-hidden="true" />
          
          {/* Dummy element mirroring the target page structure to calculate exact final coordinates */}
          <div 
            aria-hidden="true" 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none', opacity: 0, zIndex: -100 }}
          >
            <div className={`page-shell detail-page accent-${transition.project.accent}`}>
              <section className="detail-hero">
                <div className="detail-copy"></div>
                <div
                  className={`detail-visual ${previewClassName(getProjectPreviewFrames(transition.project)[0])}`}
                  ref={dummyTargetRef}
                ></div>
              </section>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
