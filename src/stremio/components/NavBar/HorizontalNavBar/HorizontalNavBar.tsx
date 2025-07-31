// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useState } from 'react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import Icon from '../../Icon/Icon';
import styles from './styles.module.less';

interface Props {
    className?: string;
    route?: string;
    query?: string;
    backButton?: boolean;
    searchBar?: boolean;
    fullscreenButton?: boolean;
    navMenu?: boolean;
}

const HorizontalNavBar = memo(({ 
    className, 
    query, 
    backButton = false, 
    searchBar = true, 
    fullscreenButton = true
}: Props) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <header className={classnames(className, styles['horizontal-nav-bar-container'])}>
            <div className={styles['nav-left']}>
                {backButton && (
                    <button
                        className={styles['nav-button']}
                        onClick={() => navigate(-1)}
                        title="Go back"
                    >
                        <Icon icon="back" />
                    </button>
                )}
                <div className={styles['brand-logo']}>
                    <span className={styles['brand-text']}>HighSeas</span>
                </div>
            </div>

            <div className={styles['nav-center']}>
                {searchBar && (
                    <form 
                        className={classnames(styles['search-container'], {
                            [styles['focused']]: isSearchFocused
                        })}
                        onSubmit={handleSearch}
                    >
                        <Icon className={styles['search-icon']} icon="search" />
                        <input
                            type="text"
                            placeholder="Search movies and TV shows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={styles['search-input']}
                        />
                        {searchQuery.trim() && (
                            <button
                                type="submit"
                                className={styles['search-button']}
                            >
                                Search
                            </button>
                        )}
                    </form>
                )}
            </div>

            <div className={styles['nav-right']}>
                {fullscreenButton && (
                    <button
                        className={styles['nav-button']}
                        onClick={toggleFullscreen}
                        title="Toggle fullscreen"
                    >
                        <Icon icon="fullscreen" />
                    </button>
                )}
            </div>
        </header>
    );
});

HorizontalNavBar.displayName = 'HorizontalNavBar';

export default HorizontalNavBar;