import { SectionAccessoryIcon } from "../components/section-accessory-icon";

type TabListItemProps = {
  iconUrl: string;
  heading: string;
  content: string;
};

const tabListData: (TabListItemProps & {})[] = [
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

const SectionTabListItem: React.FC<TabListItemProps> = ({
  heading,
  iconUrl,
  content,
}) => {
  return (
    <li className="w-full p-4 flex gap-6 items-center border-b-2 border-b-primary-400">
      <span className="flex size-12 rounded-full items-center justify-center bg-dark pb-2">
        <svg className="size-full scale-60 origin-bottom text-primary-50">
          <use xlinkHref={`#${iconUrl}`}></use>
        </svg>
      </span>
      <div className="flex-1" >
        <h4 className="font-geist-bold text-xl">{heading}</h4>
        <p className="text-dark/60 text-sm">{content}</p>
      </div>
    </li>
  );
};

export const About: React.FC = () => {
  return (
    <section className="w-full min-h-[30rem] pt-[18rem] relative bg-primary-100">
      <SectionAccessoryIcon className="left-[25vw] top-16" />
      <h2 className="font-gasoek text-[3.2rem] leading-[3.8rem] mb-14">
        The "Everything"
        <br /> Node Library
      </h2>
      <div className="bg-[#ADF845] rounded-[3.2rem] p-4 pb-0 flex items-end min-h-[40rem]">
        <div className="px-8 py-8 flex flex-col gap-6 bg-primary-50 rounded-l-[inherit]">
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
          <ul className="mt-[8rem] flex flex-col w-[clamp(8rem,30rem,95vw)] mb-16">
            {tabListData.map((item, index) => <SectionTabListItem key={index} {...item} />)}
          </ul>
        </div>
      </div>
      <CardsSection />
    </section>
  );
};

const CardsSection: React.FC = () => {
  return <div className="py-48 flex flex-col gap-16">
    <h3 className="font-gasoek text-3xl">More Than Just A Node Editor...</h3>
    <ul className="flex gap-8">
      <li className="p-10 px-14 flex flex-col gap-6 justify-center text-primary-100 bg-primary-50 rounded-[1rem] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.07)]">
        <span className="flex items-center justify-center bg-[#D100D4] size-14 rounded-full shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.15)]">
          <svg className="size-full scale-60">
            <use xlinkHref="#puzzle"></use>
          </svg>
        </span>
        <div className="flex gap-8">
          <p className="text-dark text-md max-w-[10rem] font-geist-medium">First Class Plugin support </p>
          <span className="inline-flex size-8 text-dark">
            <svg className="size-full scale-60">
            <use xlinkHref="#arrow-right"></use>
            </svg>
          </span>
        </div>
      </li>

      <li className="p-10 px-14 flex flex-col gap-6 justify-center text-primary-100 bg-primary-50 rounded-[1rem] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.07)]">
        <span className="flex items-center justify-center bg-[#D40004] size-14 rounded-full shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.15)]">
          <svg className="size-full scale-60">
            <use xlinkHref="#bolt"></use>
          </svg>
        </span>
        <div className="flex gap-8">
          <p className="text-dark text-md max-w-[10rem] font-geist-medium">lightning fast rendering engine</p>
          <span className="inline-flex size-8 text-dark">
            <svg className="size-full scale-60">
            <use xlinkHref="#arrow-right"></use>
            </svg>
          </span>
        </div>
      </li>
    </ul>
  </div>
}

