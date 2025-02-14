import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const cn = (...classes) => twMerge(clsx(classes));

export { cn };
