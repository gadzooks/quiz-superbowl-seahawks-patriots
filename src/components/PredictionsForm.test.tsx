import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type MutableRefObject, createRef } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { Question, Prediction, League } from '../types';

import { PredictionsForm } from './PredictionsForm';

// Mock the db queries
vi.mock('../db/queries', () => ({
  savePrediction: vi.fn().mockResolvedValue('test-id'),
}));

describe('PredictionsForm', () => {
  const mockQuestions: Question[] = [
    {
      id: '1',
      questionId: 'winner',
      label: 'Who will win?',
      type: 'radio',
      options: ['Seahawks', 'Patriots'],
      points: 10,
      sortOrder: 1,
      isTiebreaker: false,
    },
    {
      id: '2',
      questionId: 'total-points',
      label: 'Total points scored?',
      type: 'number',
      points: 5,
      sortOrder: 2,
      isTiebreaker: true,
    },
  ];

  const mockLeague: League = {
    id: 'league-1',
    name: 'Test League',
    slug: 'test-league',
    creatorId: 'user-1',
    isOpen: true,
    createdAt: Date.now(),
    actualResults: null,
    showAllPredictions: false,
  };

  const mockUserPrediction: Prediction = {
    id: 'pred-1',
    userId: 'user-1',
    teamName: 'Test Team',
    submittedAt: Date.now(),
    score: 0,
    tiebreakDiff: 0,
    isManager: false,
    predictions: {},
  };

  const mockShowToast = vi.fn();
  const mockOnProgressUpdate = vi.fn();
  const mockOnCompletionCelebration = vi.fn();
  const mockFormDataCacheRef = createRef<Record<
    string,
    string | number
  > | null>() as MutableRefObject<Record<string, string | number> | null>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormDataCacheRef.current = null;
  });

  it('renders all questions', () => {
    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(screen.getByText('Who will win?')).toBeInTheDocument();
    expect(screen.getByText('Total points scored?')).toBeInTheDocument();
  });

  it('renders radio options for radio questions', () => {
    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(screen.getByText('Seahawks')).toBeInTheDocument();
    expect(screen.getByText('Patriots')).toBeInTheDocument();
  });

  it('renders number input for number questions', () => {
    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    const numberInput = screen.getByPlaceholderText('Enter number');
    expect(numberInput).toBeInTheDocument();
    expect(numberInput).toHaveAttribute('type', 'number');
  });

  it('shows closed banner when league is closed', () => {
    const closedLeague = { ...mockLeague, isOpen: false };

    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={closedLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(
      screen.getByText(/Submissions Closed - Your predictions are locked in!/i)
    ).toBeInTheDocument();
  });

  it('shows info alert when league is open', () => {
    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(screen.getByText(/Make your picks, then tap Save at the bottom./i)).toBeInTheDocument();
  });

  it('disables inputs when league is closed', () => {
    const closedLeague = { ...mockLeague, isOpen: false };

    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={closedLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    const radioInputs = screen.getAllByRole('radio');
    radioInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    const numberInput = screen.getByPlaceholderText('Enter number');
    expect(numberInput).toBeDisabled();
  });

  it('updates progress when answers change', async () => {
    const user = userEvent.setup();

    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    // Initial progress (0 answered)
    expect(mockOnProgressUpdate).toHaveBeenCalledWith(0);

    // Select a radio option
    const seahawksOption = screen.getByLabelText('Seahawks');
    await user.click(seahawksOption);

    // Progress should update (1 out of 2 = 50%)
    expect(mockOnProgressUpdate).toHaveBeenCalledWith(50);
  });

  it('shows correct answer indicators when results exist and league is closed', () => {
    const closedLeague: League = {
      ...mockLeague,
      isOpen: false,
      actualResults: {
        winner: 'seahawks',
        'total-points': 45,
      },
    };

    const predictionWithAnswers: Prediction = {
      ...mockUserPrediction,
      predictions: {
        winner: 'seahawks',
        'total-points': 45,
      },
    };

    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={predictionWithAnswers}
        league={closedLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    const correctIndicators = screen.getAllByText('Correct!');
    expect(correctIndicators).toHaveLength(2);
  });

  it('shows points badge for questions with points', () => {
    render(
      <PredictionsForm
        questions={mockQuestions}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(screen.getByText('10 pts')).toBeInTheDocument();
    expect(screen.getByText('5 pts')).toBeInTheDocument();
  });

  it('shows tiebreaker badge for tiebreaker questions', () => {
    const tiebreakerQuestion: Question = {
      id: '3',
      questionId: 'tiebreaker',
      label: 'Tiebreaker question',
      type: 'number',
      points: 0,
      sortOrder: 3,
      isTiebreaker: true,
    };

    render(
      <PredictionsForm
        questions={[tiebreakerQuestion]}
        userPrediction={mockUserPrediction}
        league={mockLeague}
        userId="user-1"
        showToast={mockShowToast}
        onProgressUpdate={mockOnProgressUpdate}
        onCompletionCelebration={mockOnCompletionCelebration}
        formDataCacheRef={mockFormDataCacheRef}
      />
    );

    expect(screen.getByText('Tiebreaker')).toBeInTheDocument();
  });
});
