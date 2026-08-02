import Link from "next/link";

export const mdxComponents = {
  h1: (props) => (
    <h1
      className="mb-6 font-heading text-3xl font-bold text-gray-900 md:text-4xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-12 mb-4 font-heading text-2xl font-bold tracking-tight text-gray-900 md:text-[1.65rem]"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 mb-3 font-heading text-xl font-semibold text-gray-900"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mb-5 text-lg leading-[1.75] text-gray-700"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mb-5 list-disc space-y-2.5 pl-6 text-lg leading-relaxed text-gray-700"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mb-5 list-decimal space-y-2.5 pl-6 text-lg leading-relaxed text-gray-700"
      {...props}
    />
  ),
  li: (props) => <li className="leading-relaxed marker:text-gray-400" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  a: (props) => (
    <Link
      href={props.href || "#"}
      className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-800/50"
    >
      {props.children}
    </Link>
  ),
  blockquote: (props) => (
    <blockquote
      className="my-8 border-l-4 border-blue-600 bg-blue-50/60 px-5 py-4 text-lg italic leading-relaxed text-gray-700"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  em: (props) => <em className="text-gray-600" {...props} />,
};
