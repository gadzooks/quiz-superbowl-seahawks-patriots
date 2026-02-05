#!/usr/bin/env tsx
/* global process */
/**
 * Seed script to create a game and its questions.
 * Run this once per Super Bowl to set up the game.
 *
 * Usage:
 *   yarn seed-game lx
 *
 * This script requires a corresponding questions file in data/games/
 * Example: data/games/lx-questions.ts for Super Bowl LX
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');
  for (const line of lines) {
    const match = line.match(/^(VITE_INSTANTDB_APP_ID)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key] = value.trim();
    }
  }
}

// Set the env var so db/client.ts can access it
// Note: We need to set it before importing db modules
if (!process.env.VITE_INSTANTDB_APP_ID) {
  console.error('❌ Error: VITE_INSTANTDB_APP_ID not found in .env file');
  process.exit(1);
}

import { getGameConfig, GAMES } from '../src/config/games';
import { seedGame, seedQuestions } from '../src/db/queries';

async function main() {
  const gameId = process.argv[2];

  if (!gameId) {
    console.error('❌ Error: Game ID is required');
    console.log('Usage: yarn seed-game <gameId>');
    console.log('Example: yarn seed-game lx');
    process.exit(1);
  }

  console.log(`🏈 Seeding game: ${gameId.toUpperCase()}`);

  // Check if game config exists
  const config = getGameConfig(gameId);
  if (!config) {
    console.error(`❌ Error: No game config found for '${gameId}'`);
    console.log(`\nAvailable games: ${Object.keys(GAMES).join(', ')}`);
    process.exit(1);
  }

  // Check if questions file exists
  const questionsPath = join(__dirname, `../data/games/${gameId}-questions.ts`);
  if (!existsSync(questionsPath)) {
    console.error(`❌ Error: Questions file not found: data/games/${gameId}-questions.ts`);
    console.log(`\nPlease create the questions file for ${config.displayName} first.`);
    console.log('Copy data/games/lx-questions.ts as a template.');
    process.exit(1);
  }

  try {
    // Import the game-specific questions
    const questionsModule = await import(`../data/games/${gameId}-questions.ts`);
    const createQuestionsFunc = questionsModule[`create${gameId.toUpperCase()}Questions`];

    if (!createQuestionsFunc) {
      console.error(
        `❌ Error: Expected export 'create${gameId.toUpperCase()}Questions' not found in questions file`
      );
      process.exit(1);
    }

    console.log(`📝 Loading questions from data/games/${gameId}-questions.ts`);

    // Seed the game
    const gameInstantId = await seedGame({
      gameId: config.gameId,
      displayName: config.displayName,
      year: config.year,
      team1: config.teams[0],
      team2: config.teams[1],
    });

    console.log(`✅ Game created/loaded: ${config.displayName}`);

    // Generate and seed questions
    const questionData = createQuestionsFunc(config.teams);
    await seedQuestions(gameInstantId, questionData);

    console.log(`✅ ${questionData.length} questions seeded successfully!`);
    console.log(`\n🎉 Setup complete for ${config.displayName}!`);
    console.log(`   Game ID: ${gameId}`);
    console.log(`   InstantDB ID: ${gameInstantId}`);
  } catch (error) {
    console.error('❌ Error seeding game:', error);
    process.exit(1);
  }
}

void main();
