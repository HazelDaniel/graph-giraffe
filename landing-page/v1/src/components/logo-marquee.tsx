import type { CSSProperties } from "react";

const DEFAULT_LOGOS = [
  { name: "React", color: "#61DAFB" },
  { name: "Vue", color: "#42B883" },
  { name: "Angular", color: "#DD0031" },
  { name: "Node.js", color: "#339933" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "Python", color: "#3776AB" },
  { name: "Docker", color: "#2496ED" },
  { name: "Kubernetes", color: "#326CE6" },
  { name: "AWS", color: "#FF9900" },
  { name: "GitHub", color: "#6e7681" },
  { name: "GitLab", color: "#FC6D26" },
  { name: "Figma", color: "#F24E1E" },
  { name: "Slack", color: "#ECB22E" },
  { name: "Redis", color: "#DC382D" },
  { name: "MongoDB", color: "#47A248" },
  { name: "GraphQL", color: "#E10098" },
  { name: "Next.js", color: "#a1a1aa" },
];

//@ts-ignore
function LogoChip({ name, color }) {
  const initials = name
    .replace(".js", "")
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string[]) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="lm-chip">
      <span className="lm-glyph" style={{ "--c": color } as CSSProperties}>
        {initials}
      </span>
      <span className="lm-name">{name}</span>
    </div>
  );
}

type LogoMarqueeProps = {
  direction: "left" | "right",
  duration: number,
  pauseOnHover: boolean,
  gap: number,
  logos?: { name: string, color: string }[],
  imageUrls: string[],
};

export const LogoMarquee: React.FC<LogoMarqueeProps> = function({
  direction = "left",
  duration = 30,
  pauseOnHover = true,
  gap = 40,
  logos = DEFAULT_LOGOS,
  imageUrls
}) {
  const trackStyle = {
    "--duration": `${duration}s`,
    "--gap": `${gap}px`,
    animationDirection: direction === "right" ? "reverse" : "normal",
  };

  return (
    <div className={`lm-viewport${pauseOnHover ? " lm-pause-on-hover" : ""}`}>
      <div className="lm-track" style={trackStyle}>
        <div className="lm-group">
          {!imageUrls.length ? logos.map((logo, i) => (
            <LogoChip key={`a-${i}`} {...logo} />
          )) : imageUrls.map((url, i) => (
            <img src={url} alt={`logo chip image ${i + 1}`} className="" />
          ))
          }
        </div>
        <div className="lm-group" aria-hidden="true">
          {!imageUrls.length ? logos.map((logo, i) => (
            <LogoChip key={`a-${i}`} {...logo} />
          )) : imageUrls.map((url, i) => (
            <img src={url} alt={`logo chip image ${i + 1}`} className="" />
          ))
          }
        </div>
      </div>
    </div>
  );
}


export default LogoMarquee;