import type { CSSProperties } from "react";

type AccessoryIconProps = {
  imageUrl: string;
  steps: CSSProperties[];
  duration: number;
  ease: CSSProperties["animationTimingFunction"];
  className?: string;
  innerClassName?: string;
  innerImageUrl: string;
};

export const SectionAccessoryIcon: React.FC<Partial<AccessoryIconProps>> = ({
  className,
  innerImageUrl,
  imageUrl,
  steps,
  duration,
  ease,
  innerClassName,
}) => {
  return (
    <div
      className={`absolute flex items-center justify-center ${className || ""}`}
    >
      <span className="relative flex overflow-visible">
        <img src={imageUrl} alt="" />
        <span
          className={`absolute top-0 size-[3rem] flex items-center justify-center ${
            innerClassName || ""
          }`}
        >
          <img src={innerImageUrl} alt="" />
        </span>
      </span>
    </div>
  );
};
