import { cx } from "@/cva.config.mjs";
import { cva } from "cva";

const input = cva({
  base: "px-4 py-3 h-9 rounded-md outline outline-gray-400",
});

const Input = ({ className, ...props }) => {
  return <input className={cx(input(), className)} {...props} />;
};

export { Input };
