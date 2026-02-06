import { useEffect, useState } from 'react';

import { GAMES } from '../config/games';
import { db } from '../db/client';
import { seedGame, seedQuestions } from '../db/queries';

interface SeedTabProps {
  gameId: string;
  onSeeded: () => void;
}

type SeedStatus = 'checking' | 'needs-seed' | 'seeding' | 'success' | 'error';

/**
 * Tab shown when game/questions need to be seeded
 * Checks database status and provides seeding interface
 */
export function SeedTab({ gameId, onSeeded }: SeedTabProps) {
  const [status, setStatus] = useState<SeedStatus>('checking');
  const [message, setMessage] = useState('Checking database...');

  const config = GAMES[gameId];

  // Check database on mount
  useEffect(() => {
    void checkDatabase();
  }, [gameId]);

  async function checkDatabase() {
    setStatus('checking');
    setMessage('Checking database...');

    try {
      const result = await db.queryOnce({
        games: {
          $: { where: { gameId } },
          questions: {},
        },
      });

      const game = result.data.games[0];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const questions = game?.questions || [];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (game && questions.length > 0) {
        // Game and questions exist - shouldn't show this tab
        setStatus('success');
        setMessage(`Game already seeded with ${questions.length} questions`);
        // Auto-refresh after a moment
        setTimeout(() => {
          onSeeded();
        }, 1000);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (game && questions.length === 0) {
        // Game exists but no questions
        setStatus('needs-seed');
        setMessage('Game found but no questions. Click below to seed questions.');
      } else {
        // No game at all
        setStatus('needs-seed');
        setMessage('Game not found. Click below to seed the game and questions.');
      }
    } catch (error) {
      console.error('Error checking database:', error);
      setStatus('error');
      setMessage(
        `Error checking database: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async function handleSeed() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!config) {
      setStatus('error');
      setMessage('Invalid game configuration');
      return;
    }

    setStatus('seeding');
    setMessage('Seeding game and questions...');

    try {
      // Seed the game
      const gameInstantId = await seedGame({
        gameId: config.gameId,
        displayName: config.displayName,
        year: config.year,
        team1: config.teams[0],
        team2: config.teams[1],
      });

      setMessage('Game created. Adding questions...');

      // Dynamically import questions for this game
      const { createLXQuestions } = await import('../../data/games/lx-questions');
      const questionData = createLXQuestions(config.teams);

      await seedQuestions(gameInstantId, questionData);

      setStatus('success');
      setMessage(`Success! Seeded ${questionData.length} questions. Loading...`);

      // Wait a moment for InstantDB to sync, then notify parent
      setTimeout(() => {
        onSeeded();
      }, 1000);
    } catch (error) {
      console.error('Seeding error:', error);
      setStatus('error');
      setMessage(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">🏈 Game Setup Required</h2>

        {/* Status message */}
        <div
          className={`alert ${
            status === 'checking'
              ? 'alert-info'
              : status === 'needs-seed'
                ? 'alert-warning'
                : status === 'seeding'
                  ? 'alert-info'
                  : status === 'success'
                    ? 'alert-success'
                    : 'alert-error'
          } mb-4`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            {status === 'success' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : status === 'error' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
          <span>{message}</span>
        </div>

        {/* Game info */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {config && (
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">{config.displayName}</h3>
            <div className="text-sm text-base-content/70">
              <p>
                📅 Year: <span className="font-semibold">{config.year}</span>
              </p>
              <p>
                🏈 Teams:{' '}
                <span className="font-semibold">
                  {config.teams[0]} vs {config.teams[1]}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Seed button */}
        {status === 'needs-seed' && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => void handleSeed()}
          >
            🌱 Seed Game & Questions
          </button>
        )}

        {/* Retry button */}
        {status === 'error' && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => void handleSeed()}
            >
              🔄 Retry Seeding
            </button>
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={() => void checkDatabase()}
            >
              🔍 Check Again
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {(status === 'checking' || status === 'seeding') && (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Info box */}
        <div className="alert alert-info mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm">
            <p className="font-bold">What does seeding do?</p>
            <p>
              Creates the game entity and prediction questions in the database. This only needs to
              be done once per Super Bowl season.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
