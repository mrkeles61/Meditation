import { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { useAppStore } from '../../../stores/appStore';

interface Props {
    onSave: () => void;
    onCancel: () => void;
}

export function GymLocationPicker({ onSave, onCancel }: Props) {
    const user = useAppStore(s => s.user);
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [radius, setRadius] = useState('200');
    const [dwell, setDwell] = useState('15');
    const [saving, setSaving] = useState(false);
    const [detecting, setDetecting] = useState(false);

    async function detectLocation() {
        setDetecting(true);
        try {
            const { getCurrentPosition } = await import('../../../services/location');
            const pos = await getCurrentPosition();
            if (pos) {
                setLat(pos.lat.toFixed(6));
                setLng(pos.lng.toFixed(6));
            }
        } catch { /* location unavailable */ }
        setDetecting(false);
    }

    async function handleSave() {
        if (!user || !lat || !lng) return;
        setSaving(true);
        await supabase.from('automation_settings')
            .upsert({
                user_id: user.id,
                automation_type: 'gym',
                config: {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    radius_m: parseInt(radius) || 200,
                    dwell_minutes: parseInt(dwell) || 15,
                },
            }, { onConflict: 'user_id,automation_type' });
        setSaving(false);
        onSave();
    }

    return (
        <div className="gym-picker">
            <h3 className="gym-picker-title">Set Gym Location</h3>
            <p className="gym-picker-desc">
                We'll auto-track your gym visits when you're nearby.
            </p>

            <button
                className="gym-detect-btn"
                onClick={detectLocation}
                disabled={detecting}
            >
                {detecting ? 'Detecting...' : '📍 Use Current Location'}
            </button>

            <div className="gym-picker-fields">
                <div className="gym-field">
                    <label className="habit-modal-label">Latitude</label>
                    <input
                        className="habit-modal-input"
                        type="number"
                        step="any"
                        value={lat}
                        onChange={e => setLat(e.target.value)}
                        placeholder="e.g. 41.0082"
                    />
                </div>
                <div className="gym-field">
                    <label className="habit-modal-label">Longitude</label>
                    <input
                        className="habit-modal-input"
                        type="number"
                        step="any"
                        value={lng}
                        onChange={e => setLng(e.target.value)}
                        placeholder="e.g. 28.9784"
                    />
                </div>
                <div className="gym-field">
                    <label className="habit-modal-label">Radius (meters)</label>
                    <input
                        className="habit-modal-input"
                        type="number"
                        value={radius}
                        onChange={e => setRadius(e.target.value)}
                    />
                </div>
                <div className="gym-field">
                    <label className="habit-modal-label">Dwell Time (minutes)</label>
                    <input
                        className="habit-modal-input"
                        type="number"
                        value={dwell}
                        onChange={e => setDwell(e.target.value)}
                    />
                </div>
            </div>

            <div className="habit-modal-actions">
                <button className="habit-modal-cancel" onClick={onCancel}>Cancel</button>
                <button
                    className="habit-modal-save"
                    onClick={handleSave}
                    disabled={!lat || !lng || saving}
                >
                    {saving ? 'Saving...' : 'Save Location'}
                </button>
            </div>
        </div>
    );
}
