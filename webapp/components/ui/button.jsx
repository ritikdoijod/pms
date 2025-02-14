import { cx } from "@/cva.config.mjs";
import { cva } from "cva";

const button = cva({
  base: "px-4 py-3 h-9 text-sm font-medium leading-0 text-white bg-gray-800 shadow-sm rounded-md",
  variants: {
    variant: {
      outline: "bg-inherit text-gray-800 outline outline-gray-400",
    },
  },
});

const Button = ({ variant, className, ...props }) => {
  return <button className={cx(button({ variant }), className)} {...props} />;
};

export { Button };
