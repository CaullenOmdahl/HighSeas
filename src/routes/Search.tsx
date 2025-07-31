// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';

const Search = memo(() => {
    return (
        <div style={{ height: '100vh', backgroundColor: 'var(--primary-background-color)' }}>
            <MainNavBars>
                <div style={{ padding: '2rem', color: 'var(--primary-foreground-color)' }}>
                    <h1>Search</h1>
                    <p>Search for movies and TV shows.</p>
                </div>
            </MainNavBars>
        </div>
    );
});

Search.displayName = 'Search';

export default Search;