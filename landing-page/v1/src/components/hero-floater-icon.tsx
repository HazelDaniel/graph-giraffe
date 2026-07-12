import { useCallback, useEffect, type CSSProperties } from "react";
import { useInView } from "react-intersection-observer";

type FloaterIconProps = {
  imageUrl: string;
  delay: number;
  scale: number;
  className?: string;
  innerClassName?: string;
};

export const HeroFloaterIcon: React.FC<FloaterIconProps> = ({
  delay,
  imageUrl,
  className,
  scale,
  innerClassName,
}) => {
  const { ref, inView, entry } = useInView({
    triggerOnce: false,
  });

  const popOutCallBack = useCallback(
    (target: Element, reset: boolean) => {
      const animation = target.getAnimations()[0];
      if (!animation) return;
      const DURATION = 400;
      const targetTime = DURATION * 0.99 + delay * 1000;
      let rafID = null;

      const stop = () => {
        if ((animation.currentTime as number) >= targetTime) {
          animation.pause();
          animation.currentTime = targetTime;
          return;
        } else {
          rafID = requestAnimationFrame(stop);
        }
      };

      const returnFn = () => {
        animation?.finish();
        if (rafID) cancelAnimationFrame(rafID as unknown as number);
      };

      rafID = requestAnimationFrame(stop);

      if (reset) {
        animation.pause();
        return returnFn;
      }

      animation.currentTime = 0;
      animation.play();

      return returnFn;
    },
    [delay]
  );

  useEffect(() => {
    if (!entry) return;
    const { target } = entry;
    if (!target) return;
    popOutCallBack(target, !inView);
  }, [inView, entry]);

  return (
    <span
      className={`hero-floater-icon block absolute rounded-full ${
        className || ""
      }`}
      style={
        {
          height: `${scale}rem`,
          width: `${scale}rem`,
          "--delay": delay,
        } as CSSProperties
      }
      ref={ref}
    >
      <img
        src={imageUrl}
        alt="hero floating icon"
        className={`rounded-[inherit] ${innerClassName || ""}`}
      />
    </span>
  );
};
