import Link from "next/link";

export const mdxComponents = {
  h1: (props) => (
    <h1
      className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-2xl font-bold text-gray-900 mt-10 mb-4 font-heading"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-xl font-semibold text-gray-900 mt-8 mb-3 font-heading"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-lg text-gray-700 leading-relaxed mb-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-lg text-gray-700" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-lg text-gray-700" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-gray-900" {...props} />,
  a: (props) => (
    <Link
      href={props.href || "#"}
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {props.children}
    </Link>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  em: (props) => <em className="text-gray-600 not-italic" {...props} />,
};
