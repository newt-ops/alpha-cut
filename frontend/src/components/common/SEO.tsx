import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Alpha Cut — High-Impact Video Editing Agency',
  description = 'Alpha Cut is a boutique video editing agency specializing in retention-driven short-form, viral animation breakdowns, cinematic editing, and monthly video retainers.',
}) => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};
