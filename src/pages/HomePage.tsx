import { useState } from "react";
import { GokuCompanion } from "../components/GokuCompanion";
import { OrbitPlanets } from "../components/OrbitPlanets";
import { WorkSection } from "../components/WorkSection";

export function HomePage() {
  const [copied, setCopied] = useState(false);
  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText("ahmedy999.ay@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main id="hey">
      <GokuCompanion />
      <section className="hero" aria-labelledby="hero-title">
        <OrbitPlanets />
        <div className="hero-copy">
          <h1 id="hero-title" className="reveal">
            Messy problems, working systems.
          </h1>
        </div>
        <span className="year-mark">©2026</span>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <div className="about-lede reveal">
          <h2 id="about-title">
            I turn messy business problems into working technical systems.
          </h2>
        </div>

        <p className="about-note reveal">
          <span>*</span> I like the work before the polished screen: structure, logic, checking, and explaining what
          the system is doing.
        </p>

        <div className="about-copy reveal">
          <p>
            I am a Business Informatics student building across data, software, automation, product workflows, and
            security.
          </p>
          <p>
            My projects usually start with a practical problem: unclear data, repetitive work, risky configurations,
            or a process that needs a better interface. I like turning that into something usable, testable, and easy
            to understand.
          </p>
        </div>
      </section>

      <WorkSection />

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">
          Want to<br />reach out?
        </h2>
        <div className="contact-bottom">
          <div className="contact-links-row" aria-label="Social links">
            <a href="https://www.linkedin.com/in/ahmed-yasser-shalaby/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/AhmedYasserShalaby" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <a className="email-link" href="mailto:ahmedy999.ay@gmail.com" onClick={handleCopyEmail}>
            <span className="email-icon">
              <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </span>
            {copied ? "Copied!" : "ahmedy999.ay@gmail.com"}
          </a>
        </div>
      </section>
    </main>
  );
}
