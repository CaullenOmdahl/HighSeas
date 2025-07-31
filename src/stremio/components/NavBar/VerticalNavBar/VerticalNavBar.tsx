// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import classnames from 'classnames';
import { useLocation } from 'react-router-dom';
import NavTabButton from './NavTabButton';
import styles from './styles.module.less';

interface Tab {
    id: string;
    label: string;
    icon: string;
    href: string;
}

interface Props {
    className?: string;
    selected?: string;
    tabs?: Tab[];
}

const VerticalNavBar = memo(({ className, selected, tabs }: Props) => {
    const location = useLocation();
    const currentRoute = selected || location.pathname;

    return (
        <nav className={classnames(className, styles['vertical-nav-bar-container'])}>
            {Array.isArray(tabs) &&
                tabs.map((tab, index) => (
                    <NavTabButton
                        key={index}
                        className={styles['nav-tab-button']}
                        selected={tab.href === '/' ? currentRoute === '/' : currentRoute.startsWith(tab.href)}
                        href={tab.href}
                        icon={tab.icon}
                        label={tab.label}
                    />
                ))
            }
        </nav>
    );
});

VerticalNavBar.displayName = 'VerticalNavBar';

export default VerticalNavBar;