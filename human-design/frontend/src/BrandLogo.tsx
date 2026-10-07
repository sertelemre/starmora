import { useId } from "react";
const wordmark = "/assets/starmora-wordmark.png";

// Recolor the supplied artwork through its original alpha, preserving every
// letter and orbit contour. Crop only the transparent padding in the viewport.
export default function BrandLogo({ className = "" }: { className?: string }) {
  const filterId = useId();
  return (
    <svg
      className={`starmora-logo ${className}`}
      viewBox="96 94 1980 535"
      width="1980"
      height="535"
      role="img"
      aria-label="Starmora"
    >
      <defs>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feFlood floodColor="currentColor" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <image
        href={wordmark}
        width="2172"
        height="724"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
