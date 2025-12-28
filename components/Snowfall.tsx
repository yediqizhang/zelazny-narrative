
import React, { useMemo } from 'react';

interface ParticleProps {
  delay: string;
  duration: string;
  left: string;
  size: string;
  opacity: number;
}

const Particle: React.FC<ParticleProps> = ({ delay, duration, left, size, opacity }) => (
  <div
    className="absolute top-[-10%] bg-white rounded-full pointer-events-none"
    style={{
      left,
      width: size,
      height: `calc(${size} * 4)`,
      opacity,
      animation: `fall ${duration} linear infinite`,
      animationDelay: delay,
    }}
  />
);

const Snowfall: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${4 + Math.random() * 6}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: 0.1 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(15deg);
          }
          100% {
            transform: translateY(110vh) rotate(15deg);
          }
        }
      `}</style>
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
};

export default Snowfall;
