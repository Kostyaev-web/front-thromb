declare module 'react-router-bootstrap' {
  import * as React from 'react';
  import { LinkProps } from 'react-router-dom';

  interface LinkContainerProps extends LinkProps {
    children: React.ReactElement;
    activeClassName?: string;
    activeStyle?: React.CSSProperties;
    exact?: boolean;
  }

  export class LinkContainer extends React.Component<LinkContainerProps> {}
}
