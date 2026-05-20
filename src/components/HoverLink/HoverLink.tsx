import React from 'react';
import { cx } from '../../utils/cx';
import './HoverLink.css';

type HoverLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
};

const HoverLink = ({ children, className, ...props }: HoverLinkProps) => (
  <a {...props} className={cx('hover-underline', className)}>
    {children}
  </a>
);

export default HoverLink;
