/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'react-lazy-load-image-component' {
  import { Component } from 'react';

  export interface LazyLoadImageProps {
    src: string;
    alt?: string;
    className?: string;
    effect?: string;
    placeholder?: React.ReactNode;
    visibleByDefault?: boolean;
    wrapperClassName?: string;
    [key: string]: any;
  }

  export class LazyLoadImage extends Component<LazyLoadImageProps> {}
}
