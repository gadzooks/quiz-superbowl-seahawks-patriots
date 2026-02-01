// All Predictions Component
// Renders the table showing all predictions (admin/visible mode)

import { getState } from '../state/store';
import { getCurrentGameConfig } from '../utils/game';
import { getQuestionsForGame } from '../questions';
import { isAnswerCorrect } from './helpers';

/**
 * Render the all predictions table.
 */
export function renderAllPredictions(): void {
  const { currentLeague, allPredictions } = getState();
  const gameConfig = getCurrentGameConfig();
  const questions = getQuestionsForGame(gameConfig);

  const section = document.getElementById('allPredictionsSection');
  const tableContainer = document.getElementById('allPredictionsTable');

  if (!section || !tableContainer || !currentLeague) return;

  const teamsWithPredictions = allPredictions.filter(p => p.predictions);

  if (teamsWithPredictions.length === 0) {
    console.log('No teams have predictions yet, not showing predictions section');
    section.classList.add('hidden');
    return;
  }

  console.log(`Showing all predictions for ${teamsWithPredictions.length} teams`);
  section.classList.remove('hidden');

  // Build table
  let html = `<table style="width: 100%; border-collapse: collapse; font-size: 14px; background-color: var(--color-background);">
    <thead>
      <tr style="background-color: var(--color-primary);">
        <th style="background-color: var(--color-primary); color: var(--color-background); font-weight: 700; padding: 12px 8px; text-align: left; position: sticky; left: 0; z-index: 10;">Team</th>`;

  questions.forEach(q => {
    html += `<th style="background-color: var(--color-primary); color: var(--color-background); font-weight: 700; padding: 12px 8px; white-space: normal; min-width: 80px;">${q.label}</th>`;
  });

  html += `<th style="background-color: var(--color-primary); color: var(--color-background); font-weight: 700; padding: 12px 8px;">Score</th></tr></thead><tbody>`;

  teamsWithPredictions.forEach(pred => {
    html += `<tr style="background-color: var(--color-input-bg);">
      <td style="background-color: var(--color-input-bg); color: var(--color-text); font-weight: 700; padding: 10px 8px; border-bottom: 1px solid var(--color-text-muted); position: sticky; left: 0; z-index: 10;">${pred.teamName}</td>`;

    questions.forEach(q => {
      const value = pred.predictions?.[q.id] || '-';
      const actual = currentLeague.actualResults?.[q.id];
      const correct = actual !== undefined && isAnswerCorrect(q, pred.predictions?.[q.id], actual);

      const bgColor = correct ? '#003320' : 'var(--color-input-bg)';
      const textColor = correct ? 'var(--color-primary)' : 'var(--color-text)';

      html += `<td style="background-color: ${bgColor}; color: ${textColor}; padding: 10px 8px; border-bottom: 1px solid var(--color-text-muted);">${value}</td>`;
    });

    html += `<td style="background-color: var(--color-input-bg); color: var(--color-primary); font-weight: 700; padding: 10px 8px; border-bottom: 1px solid var(--color-text-muted); font-size: 16px;">${pred.score}</td></tr>`;
  });

  // Add actual results row if available
  if (currentLeague.actualResults && Object.keys(currentLeague.actualResults).length > 0) {
    html += `<tr style="background-color: #003320;">
      <td style="background-color: #003320; color: var(--color-primary); font-weight: 700; padding: 10px 8px; border-top: 3px solid var(--color-primary); position: sticky; left: 0; z-index: 10;">✓ ACTUAL</td>`;

    questions.forEach(q => {
      const value = currentLeague.actualResults![q.id];
      html += `<td style="background-color: #003320; color: var(--color-primary); font-weight: 600; padding: 10px 8px; border-top: 3px solid var(--color-primary);">${value !== undefined && value !== null ? value : '-'}</td>`;
    });

    html += `<td style="background-color: #003320; color: var(--color-primary); font-weight: 700; padding: 10px 8px; border-top: 3px solid var(--color-primary);">-</td></tr>`;
  }

  html += '</tbody></table>';

  tableContainer.innerHTML = html;
}

/**
 * Hide the all predictions section.
 */
export function hideAllPredictions(): void {
  const section = document.getElementById('allPredictionsSection');
  if (section) {
    section.classList.add('hidden');
  }
}
