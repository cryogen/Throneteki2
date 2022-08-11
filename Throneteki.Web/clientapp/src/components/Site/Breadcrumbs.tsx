import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BreadcrumbData } from 'use-react-router-breadcrumbs';

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: BreadcrumbData<string>[] }) => {
    console.info(breadcrumbs);
    return (
        <Breadcrumb>
            {breadcrumbs.map(({ match, breadcrumb }) => (
                <Breadcrumb.Item key={match.pathname}>
                    <Link to={match.pathname}>{breadcrumb}</Link>
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default Breadcrumbs;
