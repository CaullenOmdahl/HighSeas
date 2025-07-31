// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';

const Settings = memo(() => {
    return (
        <div style={{ height: '100vh', backgroundColor: 'var(--primary-background-color)' }}>
            <MainNavBars>
                <div style={{ padding: '2rem', color: 'var(--primary-foreground-color)' }}>
                    <h1>Settings</h1>
                    <p>App settings and preferences.</p>
                </div>
            </MainNavBars>
        </div>
    );
});

Settings.displayName = 'Settings';

export default Settings;