import React, { useState } from "react";
import { FiTwitter, FiFacebook, FiLinkedin, FiLink, FiCheck } from "react-icons/fi";

interface ShareButtonsProps {
  url: string;
  title: string;
  showCopy?: boolean;
}

const iconClass = "w-5 h-5 text-gray-800";
const btnClass =
  "bg-white border border-gray-300 hover:bg-gray-100 text-primary p-2 rounded-md transition-colors flex items-center justify-center w-10 h-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

export const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, showCopy = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex justify-center gap-3 mt-4" role="group" aria-label="Share event actions">
      {showCopy && (
        <button
          type="button"
          className={btnClass}
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy event link"}
          title={copied ? "Copied!" : "Copy event link"}
        >
          {copied ? <FiCheck className="w-5 h-5 text-green-600" /> : <FiLink className={iconClass} />}
        </button>
      )}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on X/Twitter"
        title="Share on X/Twitter"
      >
        <FiTwitter className={iconClass} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FiFacebook className={iconClass} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <FiLinkedin className={iconClass} />
      </a>
    </div>
  );
};