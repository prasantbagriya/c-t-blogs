import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'amp-story': any;
      'amp-story-page': any;
      'amp-story-grid-layer': any;
      'amp-img': any;
      'amp-story-page-outlink': any;
      'amp-story-social-share': any;
      'amp-story-cta-layer': any;
      'amp-video': any;
    }
  }

  interface HtmlHTMLAttributes<T> extends React.HTMLAttributes<T> {
    amp?: string;
  }

  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    'amp-boilerplate'?: string;
    'amp-custom'?: string;
  }

  interface ScriptHTMLAttributes<T> extends React.HTMLAttributes<T> {
    'custom-element'?: string;
  }
}
