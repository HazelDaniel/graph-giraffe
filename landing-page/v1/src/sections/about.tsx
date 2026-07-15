import { SectionAccessoryIcon } from "../components/section-accessory-icon";
import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import GLAnimatedFrame from "../components/gl-animated-frame";

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

export const SectionTabListItem: React.FC<TabListItemProps> = ({
  heading,
  iconUrl,
  content,
  activeIndex,
  id,
  setActiveIndex,
}) => {
  const active = activeIndex === id;
  return (
    <li
      className="w-[95%] p-4 flex gap-6 items-center border-b-2 border-b-primary-400 cursor-pointer"
      onClick={() => {
        setActiveIndex(id);
      }}
    >
      <span className="flex size-12 rounded-full items-center justify-center bg-dark pb-2">
        <svg className="size-full scale-60 origin-bottom text-primary-50">
          <use xlinkHref={`#${iconUrl}`}></use>
        </svg>
      </span>
      <div className="flex-1">
        <h4
          className={
            `font-geist-bold text-l pb-2` +
            ` ${active ? "decoration-wavy underline underline-offset-2" : ""}`
          }
        >
          {heading}
        </h4>
        <p className="text-dark/60 text-xs max-w-[90%]">{content}</p>
      </div>
    </li>
  );
};

export const About: React.FC = () => {
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
    <section className="w-full min-h-[30rem] pt-[18rem] relative bg-primary-100">
      <SectionAccessoryIcon
        className="left-[25vw] top-32 size-14"
        innerClassName="-right-[3.6rem]"
        innerImageUrl="/icons/scribble-text-1.svg"
        imageUrl="/images/hero-emoji-1.png"
      />
      <h2 className="font-gasoek text-[3.2rem] leading-[3.8rem] mb-14">
        The "Everything"
        <br /> Node Library
      </h2>
      <div className="bg-[#ADF845] rounded-[3.2rem] p-4 pb-0 flex items-end h-[38rem]">
        <div className="px-8 py-8 flex flex-col gap-6 bg-primary-50 rounded-l-[inherit] h-full max-w-[28rem]">
          <h4 className="text-tertiary-700">Library Features</h4>
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
          className="w-[clamp(8rem,44.2rem,95vw)] bg-primary-700 h-full rounded-r-[inherit]"
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
              "/images/about-section-image-nodes.png",
              "/images/all-you-need-image-install.png",
            ]}
            activeIndex={activeTab}
            parentRef={parentRef}
            setRenderCount={setRenderCount}
            renderCount={renderCount}
          />
        </div>
      </div>
      <CardsSection />
    </section>
  );
};

const CardsSection: React.FC = () => {
  return (
    <div className="py-48 flex flex-col gap-16">
      <h3 className="font-gasoek text-3xl">More Than Just A Node Editor...</h3>
      <ul className="flex gap-[2%] flex-wrap">
        <AboutSectionCardItem
          className="bg-[#D100D4]"
          iconUrl="puzzle"
          title="First Class Plugin support"
        />
        <AboutSectionCardItem
          className="bg-[#D40004]"
          iconUrl="bolt"
          title="lightning fast rendering engine"
        />
        <AboutSectionCardItem
          className="bg-[#00D47F]"
          iconUrl="subgraph"
          title="Reusable subgraphs"
        />

        <li className="py-14 px-6 flex flex-col gap-6 justify-center items-center text-primary-100  rounded-[1rem] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.07)] bg-[#ADF845] relative z-0">
          <div className="size-full absolute top-[-1rem] right-[-1rem] rounded-[inherit] bg-dark -z-1"></div>
          <div className="flex gap-4">
            <p className="text-primary-100  max-w-[10rem] font-geist-medium text-sm pl-2">
              Check Out More Features In{" "}
              <span className="underline underline-offset-2 decoration-wavy">
                <a href="" className="text-inherit">
                  The Docs
                </a>
              </span>
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

type IconBGProps = {
  iconUrl: string;
  className: string;
};
const CardIconBG: React.FC<IconBGProps> = ({ className, iconUrl }) => {
  return (
    <span
      className={`flex items-center justify-center ${
        className || ""
      } size-12 rounded-full shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.15)]`}
    >
      <svg className="size-full scale-60">
        <use xlinkHref={`#${iconUrl}`}></use>
      </svg>
    </span>
  );
};

type SectionCardItemProp = {
  width: number;
  height: number;
  title: string;
};

const BLOB_PATH =
  "M150.612 167H0V0H275V46.2406C275 69.808 255.895 88.913 232.328 88.913H228.699C207.136 88.913 189.655 106.393 189.655 127.957C189.655 149.52 172.175 167 150.612 167Z";

const DURATION = 0.4;

const AboutSectionCardItem: React.FC<SectionCardItemProp & IconBGProps> = ({
  className,
  iconUrl,
  title,
}) => {
  const blobRef = useRef<SVGPathElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [squarePath, setSquarePath] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!blobRef.current) return;
    const { x, y, width: w, height: h } = blobRef.current.getBBox();

    const side = Math.min(w, h);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const x0 = cx - side / 2;
    const y0 = cy - side / 2;
    const x1 = cx + (side + 1200) / 2;
    const y1 = cy + (side + 1200) / 2;

    setSquarePath(`M${x0} ${y0}H${x1}V${y1}H${x0}Z`);
  }, []);

  const morphTo = (target: string) => {
    if (!pathRef.current) return;
    gsap.to(pathRef.current, {
      duration: DURATION,
      morphSVG: { shape: target, shapeIndex: "auto" },
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  return (
    <li className="flex flex-col justify-center text-primary-100 bg-primary-50 rounded-[1rem] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.07)] relative overflow-hidden group/section-card mb-8">
      <div
        className="flex flex-col gap-6 p-8 px-12 rounded-[1rem] relative z-4"
        onMouseEnter={() => squarePath && morphTo(squarePath)}
        onMouseLeave={() => morphTo(BLOB_PATH)}
      >
        <CardIconBG className={className} iconUrl={iconUrl} />

        <div className="flex gap-4">
          <p className="text-dark text-md w-[9.6rem] font-geist-medium">
            {title}
          </p>
          <span className="inline-flex size-8 text-dark">
            <svg className="size-full scale-60 duration-[0.3s] group-hover/section-card:rotate-[-45deg] transition-transform">
              <use xlinkHref="#arrow-right"></use>
            </svg>
          </span>
        </div>
      </div>
      <div className="absolute top-0 left-0 size-full rounded-[inherit]">
        <img src="/icons/cross-stroke.svg" alt="" className="w-full" />
      </div>

      <div className="absolute top-0 left-0 size-full rounded-[inherit] z-1 text-primary-50">
        <svg
          viewBox={`0 0 265 160`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ cursor: "pointer" }}
        >
          <path ref={blobRef} d={BLOB_PATH} style={{ visibility: "hidden" }} />
          <path ref={pathRef} d={BLOB_PATH} fill="currentColor" />
        </svg>
      </div>
    </li>
  );
};
