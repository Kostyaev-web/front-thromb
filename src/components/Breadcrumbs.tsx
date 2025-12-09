import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb className="custom-breadcrumbs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Breadcrumb.Item
            key={index}
            active={isLast}
            linkAs={isLast ? 'span' : Link}
            linkProps={isLast ? {} : { to: item.path || '#' }}
          >
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}


