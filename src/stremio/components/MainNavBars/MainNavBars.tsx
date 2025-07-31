// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import classnames from 'classnames';
import { VerticalNavBar, HorizontalNavBar } from '../NavBar';
import styles from './MainNavBars.module.less';

const TABS = [
    { id: 'board', label: 'Home', icon: 'home', href: '/' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '/discover' },
    { id: 'movies', label: 'Movies', icon: 'movies', href: '/discover/movie' },
    { id: 'series', label: 'TV Shows', icon: 'series', href: '/discover/series' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

type Props = {
    className?: string,
    route?: string,
    query?: string,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, children }: Props) => {
    return (
        <div className={classnames(className, styles['main-nav-bars-container'])}>
            <HorizontalNavBar
                className={styles['horizontal-nav-bar']}
                route={route}
                query={query}
                backButton={false}
                searchBar={true}
                fullscreenButton={true}
                navMenu={false}
            />
            <VerticalNavBar
                className={styles['vertical-nav-bar']}
                selected={route}
                tabs={TABS}
            />
            <div className={styles['nav-content-container']}>{children}</div>
        </div>
    );
});

MainNavBars.displayName = 'MainNavBars';

export default MainNavBars;