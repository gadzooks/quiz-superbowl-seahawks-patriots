// AllPredictions.ts

// All Predictions Component
// Renders the table showing all predictions (admin/visible mode)

import { getState } from '../state/store';

import { isAnswerCorrect } from './helpers';

/**
 * Render the all predictions table.
 */
export function renderAllPredictions(): void {
  const { currentLeague, allPredictions, questions } = getState();

  const section = document.getElementById('allPredictionsSection');
  const tableContainer = document.getElementById('allPredictionsTable');

  if (!section || !tableContainer || !currentLeague) return;

  const teamsWithPredictions = allPredictions.filter((p) => p.predictions);

  if (teamsWithPredictions.length === 0) {
    console.log('No teams have predictions yet, not showing predictions section');
    section.classList.add('hidden');
    return;
  }

  console.log(`Showing all predictions for ${teamsWithPredictions.length} teams`);
  section.classList.remove('hidden');

  // Build table
  let html = `<table class="predictions-table">
    <thead>
      <tr>
        <th class="predictions-th predictions-th-team">Team</th>`;

  questions.forEach((q) => {
    html += `<th class="predictions-th">${q.label}</th>`;
  });

  html += `<th class="predictions-th">Score</th></tr></thead><tbody>`;

  teamsWithPredictions.forEach((pred) => {
    html += `<tr>
      <td class="predictions-td predictions-td-sticky">${pred.teamName}</td>`;

    questions.forEach((q) => {
      const value = pred.predictions?.[q.questionId] || '-';
      const actual = currentLeague.actualResults?.[q.questionId];
      const correct =
        actual !== undefined && isAnswerCorrect(q, pred.predictions?.[q.questionId], actual);

      const correctClass = correct ? ' predictions-td-correct' : '';

      html += `<td class="predictions-td${correctClass}">${value}</td>`;
    });

    html += `<td class="predictions-td predictions-td-score">${pred.score}</td></tr>`;
  });

  // Add actual results row if available
  const actualResults = currentLeague.actualResults;
  if (actualResults && Object.keys(actualResults).length > 0) {
    html += `<tr class="predictions-actual-row">
      <td class="predictions-actual-td predictions-actual-td-sticky">RESULTS</td>`;

    questions.forEach((q) => {
      const value = actualResults[q.questionId];
      html += `<td class="predictions-actual-td">${value !== undefined && value !== null ? value : '-'}</td>`;
    });

    html += `<td class="predictions-actual-td">-</td></tr>`;
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
