import { SectionAccessoryIcon } from "../components/section-accessory-icon";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useEffect, useRef, useState } from "react";
import GLAnimatedFrame from "../components/gl-animated-frame";
import { SectionTabListItem } from "./about";

type TabListItemProps = {
  iconUrl: string;
  heading: string;
  content: string;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  id: number;
};

const tabListData: (Omit<
  TabListItemProps,
  "activeIndex" | "setActiveIndex" | "id"
> & {})[] = [
  {
    content: "Answers questions instantly using knowledge you already have.",
    heading: "Custom Primitive Texture",
    iconUrl: "stack",
  },
  {
    content: "Answers questions instantly using knowledge you already have.",
    heading: "Integrable with CRDT libraries",
    iconUrl: "chat",
  },
  {
    content: "Answers questions instantly using knowledge you already have.",
    heading: "Integrable with CRDT libraries",
    iconUrl: "gear",
  },
];

gsap.registerPlugin(MorphSVGPlugin);

export const AllYouNeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const parentRef = useRef<HTMLElement>(null);
  const [renderCount, setRenderCount] = useState<number>(0);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setActiveTab((current) => {
        const next = (current + 1) % 3;
        return next;
      });
    }, 5000);

    return () => clearInterval(intervalID);
  }, []);

  return (
    <section className="w-full min-h-[30rem] pt-[18rem] pb-[8rem] relative bg-primary-200">
      <SectionAccessoryIcon
        className="right-[8vw] top-16 size-16 scale-x-[-1]"
        innerClassName="left-[-3rem] scale-x-[-1]"
        innerImageUrl="/icons/scribble-text-2.svg"
        imageUrl="/images/hero-emoji-2.svg"
      />
      <h2 className="font-gasoek text-[3.2rem] leading-[3.8rem] mb-14 text-dark">
        All You Need
        <br /> To Get Started
      </h2>
      <div className="bg-[#F8F245] rounded-[3.2rem] p-4 pb-0 flex flex-col-reverse md:flex-row items-center md:items-end md:h-[38rem]">
        <div className="px-8 py-8 flex flex-col gap-6 shadow-2xl md:shadow-[unset] -translate-y-32 md:translate-y-0 bg-primary-50 rounded-r-[inherit] md:rounded-r-[unset] rounded-l-[inherit] h-full w-[95%] md:w-max md:max-w-[28rem]">
          <div className="flex items-center w-full gap-4">
            <p className="font-geist-bold text-[1.38rem] text-tertiary-700 max-w-[17.8rem]">
              Bringing All The Goodies To You
            </p>

            <span className="size-8  rounded-full bg-[#14453E] inline-flex items-center justify-center scale-120">
              <svg
                width="80%"
                height="80%"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "scale(0.6)" }}
              >
                <path
                  d="M24.4142 2C24.4142 0.895431 23.5188 1.12907e-07 22.4142 9.55844e-07L4.41421 1.20872e-06C3.30965 5.34375e-07 2.41421 0.895432 2.41421 2C2.41421 3.10457 3.30965 4 4.41421 4L20.4142 4L20.4142 20C20.4142 21.1046 21.3096 22 22.4142 22C23.5188 22 24.4142 21.1046 24.4142 20L24.4142 2ZM1.41422 23L2.82843 24.4142L23.8284 3.41421L22.4142 2L21 0.585787L1.54972e-06 21.5858L1.41422 23Z"
                  fill="white"
                />
              </svg>
            </span>
          </div>
          <ul className="mt-auto flex flex-col w-[clamp(8rem,30rem,95vw)] mb-16 pr-4 w-full">
            {tabListData.map((item, index) => (
              <SectionTabListItem
                key={index}
                {...item}
                id={index}
                activeIndex={activeTab}
                setActiveIndex={setActiveTab}
              />
            ))}
          </ul>
        </div>
        <div
          className="w-full md:w-[clamp(8rem,44.2rem,95vw)] h-full rounded-[inherit] md:rounded-l-[unset] max-h-[30rem] md:max-h-[40rem]"
            onClick={() => {
            setActiveTab((current) => {
              const next = (current + 1) % 3;
              return next;
            });
          }}
          //@ts-ignore
          ref={parentRef}
        >
          <GLAnimatedFrame
            images={[
              {
                desktop: "/images/about-section-image-nodes.png",
                mobile: "/images/about-section-image-nodes-mobile.png"
              },
              {
                desktop: "/images/all-you-need-image-install.png",
                mobile: "/images/all-you-need-image-install-mobile.png"
              }
            ]}
            activeIndex={activeTab}
            parentRef={parentRef}
            setRenderCount={setRenderCount}
            renderCount={renderCount}
          />
        </div>
      </div>
    </section>
  );
};
