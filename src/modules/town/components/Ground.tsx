import { useMemo } from 'react';

export function Ground() {
    const sparkles = useMemo(() =>
        Array.from({ length: 12 }, () => ({
            x: Math.random() * 90 + 5,
            delay: (Math.random() * 3).toFixed(1),
        })),
        []);

    return (
        <div className="town-ground">
            <div className="ground-surface" />
            <div className="ground-detail" />
            {sparkles.map((s, i) => (
                <div
                    key={i}
                    className="ground-sparkle"
                    style={{
                        left: `${s.x}%`,
                        top: '12px',
                        '--shimmer-delay': `${s.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}
