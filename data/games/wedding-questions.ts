// wedding-questions.ts

/**
 * Wedding Quiz Questions — "Who Knows Kimberly & Amit Best?"
 *
 * ⚠️ WARNING: DO NOT IMPORT THIS FILE INTO src/ ⚠️
 *
 * This file is ONLY for seeding scripts (yarn seed-game).
 * The UI loads questions from the database, not from this file.
 *
 * Location: data/games/ (outside of src/)
 * Used by: scripts/seed-game.ts
 *
 * TO CUSTOMIZE: Fill in the correct options and update points as desired.
 * Then run: yarn seed-game wedding
 */

export function createWEDDINGQuestions(_teams: [string, string]): Array<{
  questionId: string;
  label: string;
  type: string;
  options?: string[];
  points: number;
  isTiebreaker: boolean;
}> {
  return [
    {
      questionId: 'howTheyMet',
      label: 'How did Kimberly and Amit meet?',
      type: 'radio',
      options: ['Through mutual friends', 'At work', 'Online / dating app', 'At a party'],
      points: 3,
      isTiebreaker: false,
    },
    {
      questionId: 'whoAskedOut',
      label: 'Who asked the other one out first?',
      type: 'radio',
      options: ['Kimberly', 'Amit', 'It was mutual'],
      points: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'firstDate',
      label: 'What did they do on their first date?',
      type: 'radio',
      options: ['Dinner at a restaurant', 'Coffee / drinks', 'A movie', 'Something outdoors'],
      points: 3,
      isTiebreaker: false,
    },
    {
      questionId: 'iLoveYouFirst',
      label: 'Who said "I love you" first?',
      type: 'radio',
      options: ['Kimberly', 'Amit'],
      points: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'proposalLocation',
      label: 'Where did Amit propose?',
      type: 'radio',
      options: ['At a restaurant', 'On a trip / vacation', 'At home', 'At a special location'],
      points: 3,
      isTiebreaker: false,
    },
    {
      questionId: 'datingLength',
      label: 'How long did they date before getting engaged?',
      type: 'radio',
      options: ['Less than 1 year', '1–2 years', '2–3 years', 'More than 3 years'],
      points: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'kimberlyMiddleName',
      label: "What is Kimberly's middle name?",
      type: 'radio',
      options: ['TODO: fill in options'],
      points: 1,
      isTiebreaker: false,
    },
    {
      questionId: 'amitMiddleName',
      label: "What is Amit's middle name?",
      type: 'radio',
      options: ['TODO: fill in options'],
      points: 1,
      isTiebreaker: false,
    },
    {
      questionId: 'favoriteVacation',
      label: "What is their favorite place they've traveled together?",
      type: 'radio',
      options: ['TODO: fill in options'],
      points: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'sharedHobby',
      label: 'What hobby or activity do they both love?',
      type: 'radio',
      options: ['TODO: fill in options'],
      points: 2,
      isTiebreaker: false,
    },
    {
      questionId: 'weddingGuests',
      label: 'How many guests are at the wedding today?',
      type: 'number',
      points: 0,
      isTiebreaker: true,
    },
  ];
}
