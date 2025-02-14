import { cx } from "@/cva.config.mjs";

const Separator = ({ className, ...props }) => {
  return <div className={cx("separator", className)} {...props} />;
};

export { Separator };
