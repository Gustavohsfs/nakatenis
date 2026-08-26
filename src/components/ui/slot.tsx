import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Slot mínimo — funde as props no único filho em vez de renderizar um wrapper.
 * É o que permite `<Button asChild><Link .../></Button>` sem aninhar <button>.
 */
export function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!React.isValidElement(children)) return null;

  const child = children as React.ReactElement<Record<string, unknown>>;
  const childProps = child.props;

  return React.cloneElement(child, {
    ...props,
    ...childProps,
    className: cn(className, childProps.className as string | undefined),
    style: {
      ...(props.style ?? {}),
      ...((childProps.style as React.CSSProperties | undefined) ?? {}),
    },
  });
}
