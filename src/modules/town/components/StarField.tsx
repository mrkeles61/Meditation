import { useMemo } from 'react';

export function StarField() {
    const stars = useMemo(() =>
        Array.from({ length: 60 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 55,
            size: Math.random() * 2 + 1,
            dur: (Math.random() * 2 + 1.5).toFixed(1),
            delay: (Math.random() * 4).toFixed(1),
        })),
        []);

    return (
        <div className="starfield">
            {stars.map((s, i) => (
                <div
                    key={i}
                    className="star"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        '--dur': `${s.dur}s`,
                        '--delay': `${s.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}
