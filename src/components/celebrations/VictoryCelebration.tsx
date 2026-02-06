import { useAppContext } from '../../context/AppContext';

import { SeahawksVictory1 } from './SeahawksVictory1';
import { SeahawksVictory2 } from './SeahawksVictory2';
import { SeahawksVictory3 } from './SeahawksVictory3';

/**
 * Wrapper component that renders the active victory celebration
 * Manages celebration lifecycle and cleanup
 */
export function VictoryCelebration() {
  const { activeCelebration, setActiveCelebration } = useAppContext();

  const handleComplete = () => {
    setActiveCelebration(null);
  };

  if (!activeCelebration) {
    return null;
  }

  return (
    <>
      {activeCelebration === 'stadium' && (
        <SeahawksVictory1 onComplete={handleComplete} duration={5000} />
      )}
      {activeCelebration === 'boom' && (
        <SeahawksVictory2 onComplete={handleComplete} duration={5000} />
      )}
      {activeCelebration === 'matrix' && (
        <SeahawksVictory3 onComplete={handleComplete} duration={5000} />
      )}
    </>
  );
}
