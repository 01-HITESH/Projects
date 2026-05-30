import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

type LinkButtonProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button({ children, className, href, variant = "primary", ...props }: ButtonProps) {
  const classes = twMerge(
    "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 text-sm uppercase tracking-[0.08em] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variant === "primary"
      ? "border-accent bg-accent text-bg hover:bg-light"
      : "border-border bg-transparent text-light hover:border-accent hover:text-accent",
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );

  if (href) {
    const linkProps = props as Omit<LinkButtonProps, keyof SharedProps | "href">;
    return (
      <Link className={classes} href={href} {...linkProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as Omit<NativeButtonProps, keyof SharedProps | "href">;
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
