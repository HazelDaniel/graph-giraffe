import { Button } from "./button";
import { HeroFloaterIcon } from "./hero-floater-icon";

export const Hero: React.FC = () => {
  return (
    <div
      role="hero"
      className="relative flex flex-col mt-32 min-h-[35rem] justify-end items-center pb-32"
    >
      <p className="absolute top-0 right-4 text-md w-[clamp(8rem,20vw,40rem)] z-1">
        <span className="font-geist-bold">Graph Giraffe </span>
        is a flexible TypeScript library for creating customizable node-based
        interfaces with smooth interactions, powerful APIs, and complete control
        over rendering and behavior.
      </p>

      <div className="relative w-full z-1 flex flex-col h-[35rem]">
        <div className="floater-icons flex-1 w-[clamp(8rem,48rem,95vw)] relative flex flex-col justify-end mx-auto mb-[-2.5rem]">
          <HeroFloaterIcon
            delay={0.2}
            imageUrl="/images/hero-emoji-1.png"
            scale={4}
            className="left-0"
          />
          <HeroFloaterIcon
            delay={0.3}
            imageUrl="/images/hero-emoji-2.svg"
            scale={6.8}
            className="left-[6em] bottom-[6em]"
          />
          <HeroFloaterIcon
            delay={0.4}
            imageUrl="/images/hero-emoji-3.png"
            scale={5.6}
            className="left-[16em] bottom-[10em]"
            innerClassName="scale-x-[-1]"
          />
          <HeroFloaterIcon
            delay={0.5}
            imageUrl="/images/hero-emoji-4.svg"
            scale={8.6}
            className="right-[15em] bottom-[8em]"
          />
          <HeroFloaterIcon
            delay={0.6}
            imageUrl="/images/hero-emoji-5.svg"
            scale={6.9}
            className="right-[6em] bottom-[6em]"
          />
        </div>
        <h2 className="text-6xl capitalize font-gasoek text-center  z-1 mb-8 font-bold leading-[5rem]">
          How about we bring <br /> the{" "}
          <div className="inline-block relative px-4 tabular-nums">
            <span className=" font-gasoek">canvas</span>{" "}
            <span className="absolute top-0 left-0 size-full rotate-[0.5deg] flex justify-center items-center z-[-1]">
              <img
                src="/images/hero-bg-text-deco.svg"
                alt=""
                className="w-[188%]"
              />
            </span>
          </div>{" "}
          to you?
        </h2>
      </div>

      <div className="absolute bottom-0 w-full h-full flex justify-center items-end z-0">
        <img
          src="/images/hero-giraffe.png"
          alt=""
          className="w-[38rem] h-full object-cover aspect-square"
        />
      </div>

      <div className="flex gap-8 mx-auto items-center">
        <Button text="Try Out Demo" />
        <Button text="Contribute" variant="secondary" />
      </div>
    </div>
  );
};
