import React from 'react';

interface AnnouncementBarProps {
  onRequestCallback?: () => void;
  onOpenSupabase?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = () => {
  // Hidden as per user requirement (ऊपर का Announcement Bar hide कर दिया गया है)
  return null;
};
