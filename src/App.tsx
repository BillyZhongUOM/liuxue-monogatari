import { useEffect, useState } from 'react';
import { useGame } from './store';
import { AudioManager } from './audio/AudioManager';
import { PhoneManager } from './ui/PhoneManager';
import { PhoneBanner, PhoneScreen } from './ui/Phone';
import { PlayScreen } from './ui/play';
import { CharacterCreation, EndingScreen, MainMenu } from './ui/screens';

export default function App() {
  const { state, collection, hydrate, hydrated, start, resume, toMenu } = useGame();
  const [view, setView] = useState<'menu' | 'creating'>('menu');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return <div className="app-shell" />;
  }

  let body: React.ReactNode;
  if (!state) {
    body =
      view === 'creating' ? (
        <CharacterCreation onConfirm={start} onBack={() => setView('menu')} />
      ) : (
        <MainMenu
          onNew={() => setView('creating')}
          onContinue={resume}
          hasSave={useGame.getState().hasSave()}
          collectionCount={collection.length}
        />
      );
  } else if (state.phase === 'ended') {
    body = (
      <EndingScreen
        state={state}
        collectionCount={collection.length}
        onReplay={() => {
          toMenu();
          setView('creating');
        }}
        onMenu={() => {
          toMenu();
          setView('menu');
        }}
      />
    );
  } else {
    body = <PlayScreen state={state} />;
  }

  return (
    <div className="app-shell">
      <AudioManager />
      <PhoneManager />
      {body}
      <PhoneBanner />
      <PhoneScreen state={state} />
    </div>
  );
}
