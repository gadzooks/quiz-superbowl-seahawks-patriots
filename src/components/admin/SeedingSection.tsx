import { useState, useEffect } from 'react';

import { getGameConfig } from '../../config/games';
import { fixQuestionOrder } from '../../db/fixQuestionOrder';
import { seedGame, seedQuestions } from '../../db/queries';
import type { Question } from '../../types';

interface SeedingSectionProps {
  gameId: string;
  gameInstantId: string;
  existingQuestions: Question[];
  showToast: (
    msg: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void;
}

/**
 * Admin section for seeding/updating game questions
 * Allows managers to check game setup and add missing questions
 */
export function SeedingSection({
  gameId,
  gameInstantId,
  existingQuestions,
  showToast,
}: SeedingSectionProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const config = getGameConfig(gameId);

  useEffect(() => {
    // Load question count from the data file
    void (async () => {
      try {
        const questionsModule = await import(`../../../data/games/${gameId}-questions.ts`);
        const createQuestionsFunc = questionsModule[`create${gameId.toUpperCase()}Questions`];
        if (createQuestionsFunc && config) {
          const questions = createQuestionsFunc(config.teams);
          setQuestionCount(questions.length);
        }
      } catch (error) {
        console.error('Error loading questions file:', error);
      }
    })();
  }, [gameId, config]);

  const handleSeed = async () => {
    if (!config) {
      showToast('Game configuration not found', 'error');
      return;
    }

    setIsSeeding(true);

    try {
      // Import questions module dynamically
      const questionsModule = await import(`../../../data/games/${gameId}-questions.ts`);
      const createQuestionsFunc = questionsModule[`create${gameId.toUpperCase()}Questions`];

      if (!createQuestionsFunc) {
        throw new Error(`Questions function not found for game ${gameId}`);
      }

      // Seed game (will skip if exists)
      await seedGame({
        gameId: config.gameId,
        displayName: config.displayName,
        year: config.year,
        team1: config.teams[0],
        team2: config.teams[1],
      });

      // Generate and seed questions
      const questionData = createQuestionsFunc(config.teams);
      const added = await seedQuestions(gameInstantId, questionData);

      // Fix the order of all questions to match the file order
      const desiredQuestionIds = questionData.map((q: { questionId: string }) => q.questionId);
      const fixed = await fixQuestionOrder(gameInstantId, desiredQuestionIds);

      if (added > 0 || fixed > 0) {
        const messages = [];
        if (added > 0) {
          messages.push(`Added ${added} question${added === 1 ? '' : 's'}`);
        }
        if (fixed > 0) {
          messages.push(`Fixed order of ${fixed} question${fixed === 1 ? '' : 's'}`);
        }
        showToast(`✅ ${messages.join(', ')}!`, 'success');
      } else {
        showToast('All questions already exist and in correct order', 'info');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      showToast(
        `Error seeding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsSeeding(false);
    }
  };

  if (!config) {
    return null;
  }

  const missing = questionCount - existingQuestions.length;
  const allSeeded = missing === 0;

  return (
    <div className="admin-section">
      <h3 className="admin-section-title">🎯 Game Setup</h3>

      <div className="admin-card">
        <div className="admin-info-grid">
          <div className="admin-info-row">
            <span className="admin-label">Game:</span>
            <span className="admin-value">{config.displayName}</span>
          </div>
          <div className="admin-info-row">
            <span className="admin-label">Teams:</span>
            <span className="admin-value">
              {config.teams[0]} vs {config.teams[1]}
            </span>
          </div>
          <div className="admin-info-row">
            <span className="admin-label">Questions:</span>
            <span className="admin-value">
              {existingQuestions.length} / {questionCount}
              {allSeeded && ' ✓'}
            </span>
          </div>
        </div>

        {!allSeeded && (
          <div className="admin-warning" style={{ marginTop: 'var(--space-md)' }}>
            ⚠️ {missing} question{missing === 1 ? '' : 's'} missing
          </div>
        )}

        <button
          className="button button-primary"
          onClick={() => void handleSeed()}
          disabled={isSeeding || allSeeded}
          style={{ marginTop: 'var(--space-md)', width: '100%' }}
        >
          {isSeeding
            ? '⏳ Seeding...'
            : allSeeded
              ? '✓ All Questions Loaded'
              : `🎯 Seed ${missing} Question${missing === 1 ? '' : 's'}`}
        </button>

        {allSeeded && (
          <button
            className="button button-secondary"
            onClick={() => void handleSeed()}
            disabled={isSeeding}
            style={{ marginTop: 'var(--space-sm)', width: '100%' }}
          >
            🔄 Re-run Seed (check for updates)
          </button>
        )}
      </div>
    </div>
  );
}
