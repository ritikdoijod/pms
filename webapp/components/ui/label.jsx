import { cva } from "cva";
import { cx } from "@/cva.config.mjs";

const label = cva({
  base: "text-sm font-medium text-gray-800",
});

const Label = ({ className, ...props }) => {
  return <label className={cx(label(), className)} {...props} />;
};

export { Label };
