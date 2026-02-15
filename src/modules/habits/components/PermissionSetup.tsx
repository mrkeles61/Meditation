import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { requestHealthPermissions, isHealthAvailable } from '../../../services/health';
import { requestLocationPermission } from '../../../services/location';

interface Props {
    permissionType: 'health' | 'location';
    onGranted: () => void;
    onSkip: () => void;
}

export function PermissionSetup({ permissionType, onGranted, onSkip }: Props) {
    const [requesting, setRequesting] = useState(false);

    const isWeb = !Capacitor.isNativePlatform();

    async function handleRequest() {
        setRequesting(true);
        try {
            let granted = false;
            if (permissionType === 'health') {
                const available = await isHealthAvailable();
                if (available) granted = await requestHealthPermissions();
            } else {
                granted = await requestLocationPermission();
            }
            if (granted) onGranted();
            else onSkip();
        } catch {
            onSkip();
        } finally {
            setRequesting(false);
        }
    }

    const config = permissionType === 'health'
        ? { icon: '❤️', title: 'Health Access', desc: 'Read step count from Apple Health / Google Fit to auto-complete your step habit.' }
        : { icon: '📍', title: 'Location Access', desc: 'Check if you\'re at the gym to auto-complete your gym habit.' };

    return (
        <div className="permission-setup">
            <span className="permission-icon">{config.icon}</span>
            <h3 className="permission-title">{config.title}</h3>
            <p className="permission-desc">{config.desc}</p>

            {isWeb ? (
                <p className="permission-web-note">
                    Not available on web. This feature works on iOS/Android.
                </p>
            ) : (
                <div className="permission-actions">
                    <button
                        className="permission-grant-btn"
                        onClick={handleRequest}
                        disabled={requesting}
                    >
                        {requesting ? 'Requesting...' : 'Allow Access'}
                    </button>
                    <button className="permission-skip-btn" onClick={onSkip}>
                        Skip
                    </button>
                </div>
            )}
        </div>
    );
}
