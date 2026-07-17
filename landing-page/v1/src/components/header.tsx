import { Button } from "./button";
import { Logo } from "./logo";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
//@ts-ignore
import { interpolate } from "flubber";

export const Header: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      <header
        className="fixed flex outline-dark ring-4 justify-between items-center z-10 bg-primary-50 top-[25px]"
        style={{
          backgroundImage: "url(/icons/cross-stroke-bg.svg)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain 100%",
          backgroundPosition: "10%, -10%",
        }}
      >
        <div className="logo-div">
          <Logo className="w-[1.8rem] h-[1.8rem]" variant="secondary" />
        </div>
        <ul
          className="flex-1 gap-[10%] text-lg  hidden md:flex"
          role="navigation"
          aria-label="navigation menu, desktop"
        >
          <li className="underline font-geist-bold decoration-wavy underline-offset-4">
            Docs
          </li>
          <li>Faq</li>
          <li>Community</li>
          <li>Demo</li>
        </ul>
        <Button text="Github" variant="primary" className="hidden md:flex" />
        <span className="flex md:hidden items-center justify-center text-primary-50 bg-dark p-2 size-12 rounded-md">
          <MorphToggleButton
            toggled={!expanded}
            className={"scale-50"}
            onToggle={() => setExpanded((prev) => !prev)}
            style={{}}
            aria-label={"toggle menu"}
          />
        </span>
      </header>

      <ul
        className={
          `flex flex-col fixed top-0 left-0 w-full gap-[10%] md:hidden z-4 bg-primary-50 pt-[15rem] text-2xl px-8 cursor-pointer transition-all duration-150 text-dark` +
          ` ${expanded ? "h-screen" : "h-0 scale-y-0"}`
        }
        role="navigation"
        aria-label="navigation menu, mobile"
      >
        <li
          className={`hover:translate-x-4 hover:text-dark hover:underline hover:underline-offset-8 decoration-tertiary-700 hover:decoration-double duration-150 delay-25 underline font-geist-bold decoration-wavy underline-offset-4`}
        >
          Docs
        </li>
        <li
          className={`hover:translate-x-4 hover:text-dark hover:underline hover:underline-offset-8 decoration-tertiary-700 hover:decoration-double duration-150 delay-25`}
        >
          Faq
        </li>
        <li
          className={`hover:translate-x-4 hover:text-dark hover:underline hover:underline-offset-8 decoration-tertiary-700 hover:decoration-double duration-150 delay-25`}
        >
          Community
        </li>
        <li
          className={`hover:translate-x-4 hover:text-dark hover:underline hover:underline-offset-8 decoration-tertiary-700 hover:decoration-double duration-150 delay-25`}
        >
          Demo
        </li>
      </ul>
    </>
  );
};

const VIEW_BOX = "0 0 249 249";

const X_PATH =
  "M245.879 12.3787L235.793 2.29289C235.402 1.90237 234.769 1.90237 234.379 2.2929L124.793 111.879C124.402 112.269 123.769 112.269 123.379 111.879L13.7929 2.2929C13.4024 1.90237 12.7692 1.90237 12.3787 2.29289L2.29292 12.3787C1.9024 12.7692 1.9024 13.4024 2.29292 13.7929L111.879 123.379C112.269 123.769 112.269 124.402 111.879 124.793L2.29292 234.379C1.9024 234.769 1.9024 235.402 2.29292 235.793L12.3787 245.879C12.7692 246.269 13.4024 246.269 13.7929 245.879L123.379 136.293C123.769 135.902 124.402 135.902 124.793 136.293L234.379 245.879C234.769 246.269 235.402 246.269 235.793 245.879L245.879 235.793C246.269 235.402 246.269 234.769 245.879 234.379L136.293 124.793C135.902 124.402 135.902 123.769 136.293 123.379L245.879 13.7929C246.269 13.4024 246.269 12.7692 245.879 12.3787Z";

// Two-bar mark, translated so it's centered inside a  249x249 viewbox
const BARS_PATH =
  "M244.239 146.489C245.895 146.489 247.238 147.832 247.238 149.489V163.752C247.237 165.409 245.895 166.752 244.239 166.752H4.76C3.103 166.752 1.761 165.409 1.761 163.752V149.489C1.761 147.832 3.103 146.489 4.76 146.489H244.239ZM5.76 150.489V162.752H243.239V150.489H5.76ZM244.239 82.248C245.843 82.248 247.154 83.508 247.235 85.093L247.239 85.248V99.511C247.238 101.168 245.895 102.511 244.239 102.511H4.76C3.103 102.511 1.761 101.168 1.761 99.511V85.248C1.761 83.642 3.022 82.332 4.607 82.251L4.76 82.248H244.239ZM5.76 98.511H243.239V86.248H5.76V98.511Z";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type MorphToggleButtonProp = {
  size?: number;
  duration?: number;
  color?: string;
  defaultToggled?: boolean;
  toggled?: boolean;
  onToggle?: (toggled: boolean) => void;
  easing?: (t: number) => number;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
};

export const MorphToggleButton: React.FC<MorphToggleButtonProp> = function ({
  size = 48,
  duration = 350,
  color = "currentColor",
  defaultToggled = false,
  toggled: controlledToggled = false,
  onToggle,
  easing = easeInOutCubic,
  className,
  style,
  "aria-label": ariaLabel,
}) {
  const isControlled = controlledToggled !== undefined;
  const [uncontrolledToggled, setUncontrolledToggled] =
    useState(defaultToggled);
  const toggled = isControlled ? controlledToggled : uncontrolledToggled;

  const pathRef = useRef(null);
  const progressRef = useRef(defaultToggled ? 1 : 0); // 0 = X, 1 = bars
  const rafRef = useRef(null);

  const morph = useMemo(
    () => interpolate(X_PATH, BARS_PATH, { maxSegmentLength: 8 }),
    []
  );

  const applyProgress = useCallback(
    (t: number) => {
      if (pathRef.current) {
        (pathRef.current as HTMLElement).setAttribute("d", morph(t));
      }
    },
    [morph]
  );

  useEffect(() => {
    animateTo(toggled ? 1 : 0);
  }, [toggled]);

  function animateTo(target: number) {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    cancelAnimationFrame(rafRef?.current ?? 0);

    const start = progressRef.current;
    if (prefersReducedMotion || start === target) {
      progressRef.current = target;
      applyProgress(target);
      return;
    }

    const startTime = performance.now();
    const distance = target - start;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easing(t);
      const current = start + distance * eased;
      progressRef.current = current;
      applyProgress(current);

      if (t < 1) {
        // @ts-ignore
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // @ts-ignore
    rafRef.current = requestAnimationFrame(tick);
  }

  // @ts-ignore
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function handleClick() {
    const next = !toggled;
    if (!isControlled) setUncontrolledToggled(next);
    onToggle?.(next);
    // In controlled mode the effect above will pick up the prop change;
    // in uncontrolled mode we animate immediately for a snappy response.
    if (!isControlled) animateTo(next ? 1 : 0);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={toggled}
      aria-label={ariaLabel ?? (toggled ? "Close menu" : "Open menu")}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        padding: 0,
        border: "none",
        // background: "transparent",
        cursor: "pointer",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={VIEW_BOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d={toggled ? BARS_PATH : X_PATH}
          stroke={color}
          fill="white"
        />
      </svg>
    </button>
  );
};
