import React from "react";

type SvgProps = React.SVGProps<SVGSVGElement> & { title?: string };

export default function SvgMock(props: SvgProps) {
  return <svg {...props} />;
}
