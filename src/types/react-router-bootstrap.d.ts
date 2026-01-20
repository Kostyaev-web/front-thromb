declare module 'react-router-bootstrap' {
  import { ComponentType } from 'react';
  import { NavLinkProps, LinkProps } from 'react-router-dom';

  export interface LinkContainerProps extends Omit<LinkProps, 'to'> {
    to: string;
    children: React.ReactElement;
  }

  export const LinkContainer: ComponentType<LinkContainerProps>;
}

