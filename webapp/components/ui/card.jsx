import { cn } from "@/lib/utils/cn.mjs";

const Card = ({ children, className }) => {
  return <div className={cn("card", className)}>{children}</div>;
};

const Header = ({ children, className }) => {
  return <div className={cn("card-header", className)}>{children}</div>;
};

const Title = ({ children, className }) => {
  return <div className={cn("card-title", className)}>{children}</div>;
};

const Description = ({ children, className }) => {
  return <div className={cn("card-description", className)}>{children}</div>;
};

const Content = ({ children, className }) => {
  return <div className={cn("card-content", className)}>{children}</div>;
};

Card.Header = Header;
Card.Title = Title;
Card.Description = Description;
Card.Content = Content;

export { Card };
