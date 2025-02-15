import React from 'react';

export default function BackgroundVideo({ path, type }) {
    return (
        <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={path}
            type={type}
            autoPlay
            loop
            muted
        />
    );
};
