import React from 'react';
import Image from 'next/image';
import { FiMail, FiTwitter, FiLinkedin, FiGlobe, FiX } from 'react-icons/fi';
import { Scholar } from './api';

interface ScholarDetailModalProps {
  scholar: Scholar | null;
  open: boolean;
  onClose: () => void;
}

export default function ScholarDetailModal({ scholar, open, onClose }: ScholarDetailModalProps) {
  if (!open || !scholar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#005357]"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border bg-gray-100">
            <Image 
              src={scholar.profile_img} 
              alt={scholar.name} 
              fill 
              style={{ objectFit: 'contain' }} 
              priority
            />
          </div>
          <h2 className="text-2xl font-extrabold text-[#005357] text-center">{scholar.name}</h2>
          <p className="text-[#005357]/80 font-medium text-center">{scholar.position}</p>
          <p className="text-gray-700 text-center">{scholar.organization}</p>
          {scholar.department && scholar.department.length > 0 && (
            <span className="px-3 py-1 bg-[#e6f0f0] rounded-full text-sm text-[#005357] mb-2">{scholar.department[0].name}</span>
          )}
          {scholar.profile_url && (
            <a href={scholar.profile_url} className="text-[#005357] hover:text-[#003e40] font-medium" target="_blank" rel="noopener noreferrer">
              View Full Profile
            </a>
          )}
          <div className="flex space-x-4 mt-2">
            {scholar.profile_url && (
              <a href={scholar.profile_url} className="text-gray-400 hover:text-[#005357]" title="Website" target="_blank" rel="noopener noreferrer"><FiGlobe className="w-5 h-5" /></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
