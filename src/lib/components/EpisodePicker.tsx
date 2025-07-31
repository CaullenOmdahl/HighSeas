// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import React, { useState, useCallback } from 'react';
import styles from './EpisodePicker.module.less';

interface EpisodePickerProps {
    className?: string;
    seasons: { season: number; episodes: number }[];
    selectedSeason?: number;
    selectedEpisode?: number;
    onEpisodeSelect: (season: number, episode: number) => void;
    onSeasonSelect: (season: number) => void;
}

const EpisodePicker: React.FC<EpisodePickerProps> = ({
    className,
    seasons,
    selectedSeason = 1,
    selectedEpisode = 1,
    onEpisodeSelect,
    onSeasonSelect
}) => {
    const [tempSeason, setTempSeason] = useState(selectedSeason);
    const [tempEpisode, setTempEpisode] = useState(selectedEpisode);

    const currentSeasonInfo = seasons.find(s => s.season === tempSeason);
    const maxEpisodes = currentSeasonInfo?.episodes || 1;

    const handleSeasonChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSeason = parseInt(event.target.value);
        setTempSeason(newSeason);
        setTempEpisode(1); // Reset to episode 1 when season changes
        onSeasonSelect(newSeason);
    }, [onSeasonSelect]);

    const handleEpisodeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newEpisode = parseInt(event.target.value);
        setTempEpisode(newEpisode);
    }, []);

    const handlePlayClick = useCallback(() => {
        onEpisodeSelect(tempSeason, tempEpisode);
    }, [tempSeason, tempEpisode, onEpisodeSelect]);

    return (
        <div className={`${styles['episode-picker']} ${className || ''}`}>
            <div className={styles['picker-header']}>
                <h3>Select Episode</h3>
            </div>
            
            <div className={styles['picker-controls']}>
                <div className={styles['season-selector']}>
                    <label htmlFor="season-select">Season</label>
                    <select 
                        id="season-select"
                        value={tempSeason} 
                        onChange={handleSeasonChange}
                        className={styles['season-select']}
                    >
                        {seasons.map(({ season }) => (
                            <option key={season} value={season}>
                                {season === 0 ? 'Specials' : `Season ${season}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles['episode-selector']}>
                    <label htmlFor="episode-select">Episode</label>
                    <select 
                        id="episode-select"
                        value={tempEpisode} 
                        onChange={handleEpisodeChange}
                        className={styles['episode-select']}
                    >
                        {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map(episode => (
                            <option key={episode} value={episode}>
                                Episode {episode}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={handlePlayClick}
                className={styles['play-button']}
            >
                Play Episode
            </button>
        </div>
    );
};

export default EpisodePicker;