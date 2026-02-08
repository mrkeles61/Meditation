import { useMeditationStore } from './store';
import { SetupScreen } from './components/SetupScreen';
import { SessionScreen } from './components/SessionScreen';
import { CompletionScreen } from './components/CompletionScreen';

export function MeditationPage() {
    const { phase } = useMeditationStore();

    switch (phase) {
        case 'setup':
            return <SetupScreen />;
        case 'session':
            return <SessionScreen />;
        case 'completion':
            return <CompletionScreen />;
    }
}
