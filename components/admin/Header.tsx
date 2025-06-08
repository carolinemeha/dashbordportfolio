'use client';

import { getStoredUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const user = getStoredUser();

  return (
    <div className="md:pl-64">
      <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-900"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Administration Portfolio
              </h2>
            </div>
            {user && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  Connecté en tant que <span className="font-medium">{user.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}