type ButtonProp = {
  variant?: "primary" | "secondary";
  className?: string;
  innerClassName?: string;
  text: string;
};

export const Button: React.FC<ButtonProp> = ({ variant, className, innerClassName, text }) => {
  return (
    <span
      className={
        "group/btn cursor-pointer *:cursor-pointer relative overflow-visible rounded-[0.8rem] text-primary-100" +
        ` ${className || ""}`
      }
    >
      {variant === "secondary" ? null : (
        <span className={ `absolute w-full h-full top-0 left-0 scale-y-[1.01] group-hover/btn:scale-x-[unset] group-hover/btn:perspective-distant group-hover/btn:rotate-y-[-20deg] scale-x-110 origin-left rounded-[inherit] bg-dark transition-transform duration-150 ${innerClassName || ""}`}></span>
      )}
      <button
        className={`w-max h-max outline-0 block border-0 py-[0.8rem] font-geist-medium font-bold px-6 ${
          variant === "secondary"
            ? `bg-[rgba(47,174,161,0.31)] text-tertiary-700 ${innerClassName || ""}`
            : `bg-tertiary-700 group-hover/btn:ring-2 duration-150 delay-75 group-hover/btn:ring-tertiary-200 ring-offset-4 `
        } rounded-[inherit] relative`}
      >
        {text}
      </button>
    </span>
  );
};
