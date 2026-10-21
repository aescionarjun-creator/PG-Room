"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

// Local verified fallback image stored directly in /public
export const DEFAULT_FALLBACK_IMAGE = "/fallback-room.jpg";

export interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  className = "",
  unoptimized = true,
  ...props
}: ImageWithFallbackProps) {
  const initialSrc = typeof src === "string" && src.trim() ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof src === "string" && src.trim()) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || "Stayzy accommodation space"}
      className={className}
      unoptimized={unoptimized}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
