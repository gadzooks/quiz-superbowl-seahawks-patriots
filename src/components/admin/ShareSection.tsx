interface ShareSectionProps {
  shareUrl: string;
  onCopyLink: () => void;
}

/**
 * Section for sharing league invite link with QR code
 * Includes copy-to-clipboard button and QR code for mobile scanning
 */
export function ShareSection({ shareUrl, onCopyLink }: ShareSectionProps) {
  return (
    <div className="admin-share-section" style={{ marginTop: '24px' }}>
      <div className="admin-share-title">Invite Others</div>
      <div className="admin-share-content">
        <div style={{ flex: 1 }}>
          <div className="admin-share-link-label">Share link:</div>
          <button
            onClick={onCopyLink}
            className="admin-share-link"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            📋 Copy invite link
          </button>
          <div className="admin-share-url">{shareUrl}</div>
        </div>
        <div className="admin-qr-container">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}`}
            alt="QR Code"
            className="admin-qr-image"
          />
        </div>
      </div>
    </div>
  );
}
