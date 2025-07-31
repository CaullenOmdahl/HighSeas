// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, ComponentType } from 'react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon';
import { Catalog } from '../../../lib/types';
import styles from './styles.module.less';

interface MetaRowProps {
    className?: string;
    catalog: Catalog;
    itemComponent: ComponentType<any>;
    title?: string;
}

const CATALOG_PREVIEW_SIZE = 10;

const MetaRow = memo(({ className, catalog, itemComponent: ItemComponent, title }: MetaRowProps) => {
    const navigate = useNavigate();
    const catalogTitle = title || catalog.name;
    
    const handleSeeAll = () => {
        navigate(`/discover/${catalog.type}?catalog=${catalog.id}`);
    };

    if (catalog.error) {
        return (
            <div className={classnames(className, styles['meta-row-container'])}>
                <div className={styles['header-container']}>
                    <div className={styles['title-container']}>{catalogTitle}</div>
                </div>
                <div className={styles['error-container']}>
                    <div className={styles['error-message']}>
                        Failed to load {catalogTitle.toLowerCase()}
                    </div>
                </div>
            </div>
        );
    }

    const visibleItems = catalog.items.slice(0, CATALOG_PREVIEW_SIZE);
    const remainingSlots = Math.max(0, CATALOG_PREVIEW_SIZE - visibleItems.length);

    return (
        <div className={classnames(className, styles['meta-row-container'])}>
            <div className={styles['header-container']}>
                <div className={styles['title-container']}>{catalogTitle}</div>
                {catalog.items.length > CATALOG_PREVIEW_SIZE && (
                    <button 
                        className={styles['see-all-container']}
                        onClick={handleSeeAll}
                    >
                        <div className={styles['label']}>See All</div>
                        <Icon icon="forward" />
                    </button>
                )}
            </div>
            
            <div className={styles['meta-items-container']}>
                {visibleItems.map((item) => (
                    <ItemComponent
                        key={item.id}
                        {...item}
                        className={styles['meta-item']}
                    />
                ))}
                
                {/* Empty placeholders for consistent spacing */}
                {Array.from({ length: remainingSlots }, (_, index) => (
                    <div
                        key={`placeholder-${index}`}
                        className={classnames(styles['meta-item'], styles['placeholder'])}
                    />
                ))}
            </div>
        </div>
    );
});

// Loading placeholder component
const MetaRowPlaceholder = memo(() => (
    <div className={styles['meta-row-container']}>
        <div className={styles['header-container']}>
            <div className={classnames(styles['title-container'], styles['loading'])}>
                <div className={styles['loading-bar']} />
            </div>
        </div>
        <div className={styles['meta-items-container']}>
            {Array.from({ length: CATALOG_PREVIEW_SIZE }, (_, index) => (
                <div
                    key={`loading-${index}`}
                    className={classnames(styles['meta-item'], styles['loading-placeholder'])}
                >
                    <div className={styles['loading-poster']} />
                    <div className={styles['loading-title']} />
                </div>
            ))}
        </div>
    </div>
));

MetaRowPlaceholder.displayName = 'MetaRowPlaceholder';

MetaRow.displayName = 'MetaRow';

// Add the Placeholder component as a static property
const MetaRowWithPlaceholder = Object.assign(MetaRow, {
    Placeholder: MetaRowPlaceholder
});

export default MetaRowWithPlaceholder;