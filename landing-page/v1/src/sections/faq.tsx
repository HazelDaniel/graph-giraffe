import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqData: FaqItem[] = [
  {
    question: "Is Graph Giraffe free to use?",
    answer:
      "Yes. Graph Giraffe is open-source and licensed under MIT. You can use it in personal and commercial projects without restrictions.",
  },
  {
    question: "Which frameworks does it support?",
    answer:
      "Graph Giraffe is framework-agnostic at its core. It ships with first-class React bindings, and community adapters exist for Vue and Svelte.",
  },
  {
    question: "Can I use it for real-time collaborative editing?",
    answer:
      "Absolutely. Graph Giraffe integrates with CRDT libraries like Yjs and Automerge, so multiple users can edit the same graph simultaneously without conflicts.",
  },
  {
    question: "How does performance scale with large graphs?",
    answer:
      "The rendering engine uses viewport culling and incremental layout updates, so only visible nodes are drawn. Graphs with thousands of nodes stay smooth and responsive.",
  },
  {
    question: "Can I customize how nodes and edges look?",
    answer:
      "Fully. You control the rendering of every node, edge, and port. Bring your own components or use the built-in primitives as a starting point.",
  },
  {
    question: "Is there a plugin system?",
    answer:
      "Yes. Graph Giraffe has a first-class plugin API that lets you extend behavior — from custom selection logic to undo/redo, minimap, and more.",
  },
];

const FaqAccordionItem: React.FC<{
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => {
  return (
    <div
      className="border-b border-primary-400 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between py-6 gap-4">
        <h4 className="font-geist-bold text-dark text-base md:text-lg">
          {item.question}
        </h4>
        <span
          className={`shrink-0 size-8 rounded-full bg-tertiary-700 inline-flex items-center justify-center transition-transform duration-300 -translate-x-4 md:-translate-x-8 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1V13M1 7H13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-dark/70 text-sm md:text-base max-w-[40rem] px-2 md:pl-4">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-32">
      <h2 className="font-gasoek text-[3.2rem] leading-[3.8rem] mb-14 text-dark">
        Frequently Asked
        <br /> Questions
      </h2>
      <div className=" w-full">
        {faqData.map((item, index) => (
          <FaqAccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        ))}
      </div>
    </section>
  );
};
