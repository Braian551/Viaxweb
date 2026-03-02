import React, { useState } from 'react';
import { getR2ImageUrl } from '../../../utils/r2Images';

/**
 * ProfileAvatar - Profile picture with R2 fallback
 * Shows initials when image fails or is empty
 */
const ProfileAvatar = ({
    src,
    name = '',
    size = 44,
    borderRadius = 14,
    bgColor = '#2196f3',
    fontSize,
    style = {},
    className = ''
}) => {
    const [imgError, setImgError] = useState(false);

    const resolvedSrc = src ? getR2ImageUrl(src) : '';
    const showImage = resolvedSrc && !imgError;
    const initials = name
        ? name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
        : '?';

    const computedFontSize = fontSize || `${Math.max(size * 0.38, 12)}px`;

    return (
        <div
            className={`v-avatar ${className}`}
            style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius,
                background: showImage ? 'transparent' : bgColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontWeight: 700,
                fontSize: computedFontSize,
                letterSpacing: '-0.5px',
                ...style
            }}
        >
            {showImage ? (
                <img
                    src={resolvedSrc}
                    alt={name}
                    onError={() => setImgError(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                    loading="lazy"
                />
            ) : (
                initials
            )}
        </div>
    );
};

export default ProfileAvatar;
