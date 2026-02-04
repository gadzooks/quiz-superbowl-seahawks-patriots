/* global process */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { init } from '@instantdb/core';

const appId = process.env.INSTANT_APP_ID || process.env.VITE_INSTANTDB_APP_ID;

if (!appId) {
  console.error('❌ Error: INSTANT_APP_ID or VITE_INSTANTDB_APP_ID environment variable required');
  console.log('\nUsage:');
  console.log('  INSTANT_APP_ID=your-app-id yarn run db:verify');
  console.log('  or');
  console.log('  VITE_INSTANTDB_APP_ID=your-app-id yarn run db:verify\n');
  process.exit(1);
}

// Use untyped client for verification
const db = init({ appId }) as any;

interface DataCheck {
  name: string;
  test: () => Promise<boolean> | boolean;
  critical: boolean; // If true, fail verification on error
}

/**
 * Verify data integrity after schema migration
 */
async function verifyDataIntegrity() {
  console.log('\n🔍 Verifying Data Integrity\n');
  console.log('='.repeat(80));
  console.log(`App ID: ${appId}\n`);

  try {
    // Fetch all data
    const { data, error } = await db.query({
      leagues: {},
      predictions: {},
      games: {},
      questions: {},
    });

    if (error) {
      console.error('❌ Failed to query database:', error);
      process.exit(1);
    }

    console.log('📊 Data Summary:');
    console.log(`   Leagues: ${data.leagues?.length || 0}`);
    console.log(`   Predictions: ${data.predictions?.length || 0}`);
    console.log(`   Games: ${data.games?.length || 0}`);
    console.log(`   Questions: ${data.questions?.length || 0}\n`);

    // Define integrity checks
    const checks: DataCheck[] = [
      {
        name: 'All leagues have required fields (name, slug, creatorId)',
        critical: true,
        test: () =>
          data.leagues?.every((l: any) => l.name && l.slug && l.creatorId !== undefined) ?? true,
      },
      {
        name: 'All league slugs are unique',
        critical: true,
        test: () => {
          const slugs = data.leagues?.map((l: any) => l.slug) || [];
          return slugs.length === new Set(slugs).size;
        },
      },
      {
        name: 'All predictions have required fields (userId, teamName)',
        critical: true,
        test: () => data.predictions?.every((p: any) => p.userId && p.teamName) ?? true,
      },
      {
        name: 'All predictions have valid scores',
        critical: false,
        test: () =>
          data.predictions?.every(
            (p: any) => typeof p.score === 'number' || p.score === undefined
          ) ?? true,
      },
      {
        name: 'All predictions have valid tiebreak differences',
        critical: false,
        test: () =>
          data.predictions?.every(
            (p: any) => typeof p.tiebreakDiff === 'number' || p.tiebreakDiff === undefined
          ) ?? true,
      },
      {
        name: 'All games have required fields (gameId, displayName, year)',
        critical: true,
        test: () =>
          data.games?.every((g: any) => g.gameId && g.displayName && g.year !== undefined) ?? true,
      },
      {
        name: 'All game IDs are unique',
        critical: true,
        test: () => {
          const gameIds = data.games?.map((g: any) => g.gameId) || [];
          return gameIds.length === new Set(gameIds).size;
        },
      },
      {
        name: 'All questions have required fields (questionId, label, type)',
        critical: true,
        test: () => data.questions?.every((q: any) => q.questionId && q.label && q.type) ?? true,
      },
      {
        name: 'All questions have valid point values',
        critical: true,
        test: () =>
          data.questions?.every((q: any) => typeof q.points === 'number' && q.points > 0) ?? true,
      },
      {
        name: 'All boolean fields are actual booleans',
        critical: false,
        test: () => {
          const booleanChecks = [
            ...(data.leagues?.map((l: any) => typeof l.isOpen === 'boolean') || []),
            ...(data.leagues?.map((l: any) => typeof l.showAllPredictions === 'boolean') || []),
            ...(data.predictions?.map((p: any) => typeof p.isManager === 'boolean') || []),
            ...(data.questions?.map((q: any) => typeof q.isTiebreaker === 'boolean') || []),
          ];
          return booleanChecks.every((check) => check);
        },
      },
      {
        name: 'All date fields are valid dates',
        critical: false,
        test: () => {
          const dateChecks = [
            ...(data.leagues?.map(
              (l: any) => l.createdAt === undefined || !isNaN(new Date(l.createdAt).getTime())
            ) || []),
            ...(data.predictions?.map(
              (p: any) => p.submittedAt === undefined || !isNaN(new Date(p.submittedAt).getTime())
            ) || []),
          ];
          return dateChecks.every((check) => check);
        },
      },
    ];

    // Run checks
    console.log('Running integrity checks:\n');
    let passed = 0;
    let failed = 0;
    let criticalFailed = 0;

    for (const check of checks) {
      try {
        const result = await check.test();
        if (result) {
          console.log(`✅ ${check.name}`);
          passed++;
        } else {
          const icon = check.critical ? '🚨' : '⚠️ ';
          console.log(`${icon} ${check.name}`);
          failed++;
          if (check.critical) criticalFailed++;
        }
      } catch (error) {
        console.log(`❌ ${check.name} - Error: ${error}`);
        failed++;
        if (check.critical) criticalFailed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Verification Summary:');
    console.log(`   ✅ Passed: ${passed}/${checks.length}`);
    console.log(`   ❌ Failed: ${failed}/${checks.length}`);
    if (criticalFailed > 0) {
      console.log(`   🚨 Critical failures: ${criticalFailed}\n`);
    }

    if (criticalFailed > 0) {
      console.log('🛑 CRITICAL ISSUES DETECTED\n');
      console.log('Data integrity is compromised. Do not proceed with this migration.');
      console.log('Review the failed checks above and fix the data before continuing.\n');
      process.exit(1);
    } else if (failed > 0) {
      console.log('⚠️  Some non-critical checks failed\n');
      console.log('Review the warnings above. Data is mostly intact but may have minor issues.\n');
      process.exit(0); // Non-critical failures don't block deployment
    } else {
      console.log('✅ All integrity checks passed!\n');
      console.log('Data is in good shape and ready for migration.\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    process.exit(1);
  }
}

// Run verification
void verifyDataIntegrity();
