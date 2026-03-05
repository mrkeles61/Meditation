import { useTownStore } from '../stores/townStore';

export function TownHUD() {
    const totalLevel = useTownStore((s) => s.totalLevel);
    const buildings = useTownStore((s) => s.buildings);
    const daysSinceStart = useTownStore((s) => s.daysSinceStart);

    const activeStreaks = Object.values(buildings).filter(b => b.streakDays > 0).length;

    const hour = new Date().getHours();
    let timeIcon = '☀️';
    if (hour >= 20 || hour < 6) timeIcon = '🌙';
    else if (hour >= 18) timeIcon = '🌅';

    return (
        <div className="town-hud">
            <div className="town-hud-row">
                <span className="town-hud-name">🏘️ Your Village</span>
                <span className="town-hud-right">Day {daysSinceStart} {timeIcon}</span>
            </div>
            <div className="town-hud-row town-hud-sub">
                <span>Active Streaks: {activeStreaks}</span>
                <span>Level: {totalLevel}</span>
            </div>
        </div>
    );
}
