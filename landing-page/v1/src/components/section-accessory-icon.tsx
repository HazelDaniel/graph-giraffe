import type { CSSProperties } from "react";

type AccessoryIconProps = {
  imageUrl: string;
  steps: CSSProperties[];
  duration: number;
  ease: CSSProperties["animationTimingFunction"];
  className?: string;
  innerClassName?: string;
};

export const SectionAccessoryIcon: React.FC<
  Partial<AccessoryIconProps>
> = ({className}) => {
  return <div className={`absolute flex items-center justify-center ${className || ""}`}>
    <span className="relative flex overflow-visible">
      <img src="/public/images/hero-emoji-1.png" alt="" />
      <span className="absolute top-0 right-[-2rem] size-[3rem] flex items-center justify-center">
        <img src="/public/icons/scribble-text-1.svg" alt="" />
      </span>
    </span>
  </div>
};
