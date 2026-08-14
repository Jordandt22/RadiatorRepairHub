import Link from "next/link";

export const mdxComponents = {
  h1: (props) => (
    <h1
      className="mb-6 font-heading text-3xl font-bold text-foreground md:text-4xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-12 mb-4 font-heading text-2xl font-bold tracking-tight text-foreground md:text-[1.65rem]"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 mb-3 font-heading text-xl font-semibold text-foreground"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mb-5 text-lg leading-[1.75] text-muted-foreground"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mb-5 list-disc space-y-2.5 pl-6 text-lg leading-relaxed text-muted-foreground"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mb-5 list-decimal space-y-2.5 pl-6 text-lg leading-relaxed text-muted-foreground"
      {...props}
    />
  ),
  li: (props) => (
    <li className="leading-relaxed marker:text-muted-foreground" {...props} />
  ),
  strong: (props) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props) => (
    <Link
      href={props.href || "#"}
      className="font-medium text-interactive underline decoration-interactive/30 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary/50"
    >
      {props.children}
    </Link>
  ),
  blockquote: (props) => (
    <blockquote
      className="my-8 rounded-lg border border-border bg-tint px-5 py-4 text-lg italic leading-relaxed text-muted-foreground"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  em: (props) => <em className="text-muted-foreground" {...props} />,
};
