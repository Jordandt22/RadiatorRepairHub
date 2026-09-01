import { Children, cloneElement, isValidElement } from "react";

/**
 * Next may pass multiple page segments as sibling children. Without keys React
 * warns via OuterLayoutRouter — assign stable keys when missing.
 */
function withLayoutKeys(children) {
  return Children.toArray(children).map((child, index) => {
    if (!isValidElement(child) || child.key != null) {
      return child;
    }

    return cloneElement(child, { key: `layout-segment-${index}` });
  });
}

export default function Template({ children }) {
  return <>{withLayoutKeys(children)}</>;
}
