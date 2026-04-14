import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

/**
 * Takes plain text and returns React nodes with URLs converted to clickable links.
 */
export function linkifyText(text: string): React.ReactNode {
  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-primary underline underline-offset-2 break-all hover:text-primary/80"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
