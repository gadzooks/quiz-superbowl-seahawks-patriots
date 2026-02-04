declare const __GIT_COMMIT__: string;
declare const __GIT_COMMIT_MESSAGE__: string;

interface BuildInfoProps {
  appId: string;
}

/**
 * Display build information including git commit and database ID
 * Shows deployment context for debugging
 */
export function BuildInfo({ appId }: BuildInfoProps) {
  const gitCommit = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev';
  const commitMessage =
    typeof __GIT_COMMIT_MESSAGE__ !== 'undefined' ? __GIT_COMMIT_MESSAGE__ : 'dev';

  return (
    <div className="admin-build-info">
      <div className="admin-build-message">{commitMessage}</div>
      <div className="admin-build-details">
        <span>
          Commit: <code>{gitCommit}</code>
        </span>
        <span>
          DB: <code>...{appId.slice(-5)}</code>
        </span>
      </div>
    </div>
  );
}
