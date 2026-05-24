import { useReducedMotion } from "../hooks/useReducedMotion";
import worldBeerus from "../../assets/dragon-guide/world-beerus.png";
import worldEarth from "../../assets/dragon-guide/world-earth.png";
import worldKai from "../../assets/dragon-guide/world-king-kai.png";
import worldNamek from "../../assets/dragon-guide/world-namek.png";
import worldSupremeKai from "../../assets/dragon-guide/world-supreme-kai.png";
import worldVegeta from "../../assets/dragon-guide/world-vegeta.png";
import worldYardrat from "../../assets/dragon-guide/world-yardrat.png";

type PlanetConfig = {
  id: string;
  image: string;
  size: number;
  ring: number;
  speed: number;
  delay: number;
};

const planets: PlanetConfig[] = [
  { id: "earth", image: worldEarth, size: 54, ring: 1, speed: 28, delay: 0 },
  { id: "namek", image: worldNamek, size: 48, ring: 1, speed: 28, delay: -10 },
  { id: "vegeta", image: worldVegeta, size: 44, ring: 2, speed: 36, delay: -4 },
  { id: "king-kai", image: worldKai, size: 38, ring: 2, speed: 36, delay: -18 },
  { id: "yardrat", image: worldYardrat, size: 42, ring: 3, speed: 48, delay: -8 },
  { id: "beerus", image: worldBeerus, size: 50, ring: 3, speed: 48, delay: -24 },
  { id: "supreme-kai", image: worldSupremeKai, size: 36, ring: 3, speed: 48, delay: -38 },
];

const ringRadii = [
  { rx: 280, ry: 120 },
  { rx: 420, ry: 170 },
  { rx: 580, ry: 220 },
];

export function OrbitPlanets() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`orbit-system ${reducedMotion ? "is-reduced" : ""}`}
      aria-hidden="true"
    >
      {/* Orbit ring wireframes */}
      {ringRadii.map((ring, i) => (
        <div
          key={`ring-${i}`}
          className="orbit-ring-path"
          style={{
            width: ring.rx * 2,
            height: ring.ry * 2,
          }}
        />
      ))}

      {/* Planets on orbits */}
      {planets.map((planet) => {
        const ring = ringRadii[planet.ring - 1];
        return (
          <div
            key={planet.id}
            className="orbit-planet-wrapper"
            style={{
              "--orbit-rx": `${ring.rx}px`,
              "--orbit-ry": `${ring.ry}px`,
              "--orbit-speed": `${planet.speed}s`,
              "--orbit-delay": `${planet.delay}s`,
              "--planet-size": `${planet.size}px`,
              width: ring.rx * 2,
              height: ring.ry * 2,
            } as React.CSSProperties}
          >
            <div className="orbit-planet">
              <img
                src={planet.image}
                alt=""
                draggable="false"
                style={{ width: planet.size, height: planet.size }}
              />
              <div className="orbit-planet-glow" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
