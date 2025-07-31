// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import Icon from '../../Icon/Icon';
import styles from './styles.module.less';

interface Props {
    className?: string;
    selected?: boolean;
    href?: string;
    icon?: string;
    label?: string;
    onClick?: () => void;
}

const NavTabButton = memo(({ className, selected, href, icon, label, onClick }: Props) => {
    const buttonContent = (
        <>
            {icon && (
                <div className={styles['nav-tab-icon-container']}>
                    <Icon className={styles['nav-tab-icon']} icon={icon} />
                </div>
            )}
            {label && (
                <div className={styles['nav-tab-label-container']}>
                    <div className={styles['nav-tab-label']} title={label}>
                        {label}
                    </div>
                </div>
            )}
        </>
    );

    const buttonClass = classnames(
        className,
        styles['nav-tab-button-container'],
        { [styles['selected']]: selected }
    );

    if (href) {
        return (
            <Link
                className={buttonClass}
                to={href}
                onClick={onClick}
            >
                {buttonContent}
            </Link>
        );
    }

    return (
        <button
            className={buttonClass}
            onClick={onClick}
        >
            {buttonContent}
        </button>
    );
});

NavTabButton.displayName = 'NavTabButton';

export default NavTabButton;