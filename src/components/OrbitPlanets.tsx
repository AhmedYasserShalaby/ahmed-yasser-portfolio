import type { CSSProperties } from "react";
import beerus from "../../assets/dragon-guide/planets-2d/beerus.webp";
import earth from "../../assets/dragon-guide/planets-2d/earth.webp";
import kingKai from "../../assets/dragon-guide/planets-2d/king-kai.webp";
import namek from "../../assets/dragon-guide/planets-2d/namek.webp";
import supremeKai from "../../assets/dragon-guide/planets-2d/supreme-kai.webp";
import vegeta from "../../assets/dragon-guide/planets-2d/vegeta.webp";
import yardrat from "../../assets/dragon-guide/planets-2d/yardrat.webp";
import { useReducedMotion } from "../hooks/useReducedMotion";

type PlanetConfig = {
  id: string;
  image: string;
  size: number;
  x: string;
  y: string;
  glow: string;
  rotation: number;
  duration: number;
  delay: number;
  floatDuration: number;
  spinDuration: number;
  path: "a" | "b" | "c";
  drift: {
    ax: string;
    ay: string;
    bx: string;
    by: string;
    cx: string;
    cy: string;
  };
};

const planets: PlanetConfig[] = [
  {
    id: "namek",
    image: namek,
    size: 430,
    x: "12%",
    y: "120px",
    glow: "rgba(194, 255, 105, 0.42)",
    rotation: -12,
    duration: 210,
    delay: -8,
    floatDuration: 9.8,
    spinDuration: 58,
    path: "a",
    drift: { ax: "-18px", ay: "6px", bx: "28px", by: "-10px", cx: "-12px", cy: "14px" },
  },
  {
    id: "vegeta",
    image: vegeta,
    size: 390,
    x: "31%",
    y: "104px",
    glow: "rgba(255, 94, 50, 0.38)",
    rotation: 9,
    duration: 225,
    delay: -42,
    floatDuration: 11.2,
    spinDuration: 66,
    path: "b",
    drift: { ax: "18px", ay: "-6px", bx: "-26px", by: "12px", cx: "14px", cy: "6px" },
  },
  {
    id: "king-kai",
    image: kingKai,
    size: 320,
    x: "48%",
    y: "175px",
    glow: "rgba(110, 214, 255, 0.36)",
    rotation: -6,
    duration: 205,
    delay: -76,
    floatDuration: 8.8,
    spinDuration: 54,
    path: "c",
    drift: { ax: "-10px", ay: "-8px", bx: "30px", by: "8px", cx: "-22px", cy: "10px" },
  },
  {
    id: "yardrat",
    image: yardrat,
    size: 415,
    x: "64%",
    y: "128px",
    glow: "rgba(247, 130, 255, 0.34)",
    rotation: 14,
    duration: 238,
    delay: -110,
    floatDuration: 10.5,
    spinDuration: 62,
    path: "a",
    drift: { ax: "12px", ay: "10px", bx: "-24px", by: "-8px", cx: "26px", cy: "12px" },
  },
  {
    id: "beerus",
    image: beerus,
    size: 470,
    x: "82%",
    y: "92px",
    glow: "rgba(190, 140, 255, 0.4)",
    rotation: -10,
    duration: 218,
    delay: -144,
    floatDuration: 12.4,
    spinDuration: 72,
    path: "b",
    drift: { ax: "-28px", ay: "6px", bx: "18px", by: "-12px", cx: "-14px", cy: "10px" },
  },
  {
    id: "supreme-kai",
    image: supremeKai,
    size: 350,
    x: "21%",
    y: "185px",
    glow: "rgba(194, 255, 212, 0.34)",
    rotation: 7,
    duration: 230,
    delay: -178,
    floatDuration: 11.6,
    spinDuration: 68,
    path: "c",
    drift: { ax: "24px", ay: "-8px", bx: "-14px", by: "12px", cx: "20px", cy: "-12px" },
  },
  {
    id: "earth",
    image: earth,
    size: 400,
    x: "94%",
    y: "112px",
    glow: "rgba(90, 205, 255, 0.34)",
    rotation: -4,
    duration: 212,
    delay: -212,
    floatDuration: 9.2,
    spinDuration: 60,
    path: "a",
    drift: { ax: "-20px", ay: "-6px", bx: "14px", by: "14px", cx: "-30px", cy: "8px" },
  },
];

export function OrbitPlanets() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`orbit-system anime-planet-system ${reducedMotion ? "is-reduced" : ""}`}
      aria-hidden="true"
    >
      {planets.map((planet) => (
        <figure
          key={planet.id}
          className={`anime-planet path-${planet.path}`}
          style={
            {
              "--planet-size": `${planet.size}px`,
              "--planet-x": planet.x,
              "--planet-y": planet.y,
              "--planet-delay": `${planet.delay}s`,
              "--planet-cycle": `${planet.duration}s`,
              "--planet-float-cycle": `${planet.floatDuration}s`,
              "--planet-spin-cycle": `${planet.spinDuration}s`,
              "--planet-glow": planet.glow,
              "--planet-rotation": `${planet.rotation}deg`,
              "--planet-drift-ax": planet.drift.ax,
              "--planet-drift-ay": planet.drift.ay,
              "--planet-drift-bx": planet.drift.bx,
              "--planet-drift-by": planet.drift.by,
              "--planet-drift-cx": planet.drift.cx,
              "--planet-drift-cy": planet.drift.cy,
            } as CSSProperties
          }
        >
          <span className="anime-planet-float">
            <img src={planet.image} alt="" draggable="false" />
          </span>
        </figure>
      ))}
    </div>
  );
}
