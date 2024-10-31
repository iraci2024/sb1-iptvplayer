import { useVirtual } from 'react-virtual';
import { useRef, useMemo, useCallback } from 'react';
import { Tv2, Search } from 'lucide-react';
import type { Channel } from '../types';

interface ChannelListProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function ChannelList({
  channels,
  onChannelSelect,
  searchTerm,
  onSearchChange,
}: ChannelListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredChannels = useMemo(() => 
    channels.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [channels, searchTerm]
  );

  const handleChannelSelect = useCallback((channel: Channel) => {
    onChannelSelect(channel);
  }, [onChannelSelect]);

  const rowVirtualizer = useVirtual({
    size: filteredChannels.length,
    parentRef,
    estimateSize: useCallback(() => 70, []),
    overscan: 5,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar canais..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            const channel = filteredChannels[virtualRow.index];
            if (!channel) return null;
            
            return (
              <div
                key={virtualRow.index}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  onClick={() => handleChannelSelect(channel)}
                  className="w-full p-4 hover:bg-gray-100 transition-colors flex items-center gap-4 border-b"
                >
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="20" height="15" x="2" y="7" rx="2" ry="2"/%3E%3Cpolyline points="17 2 12 7 7 2"/%3E%3Cline x1="12" x2="12" y1="22" y2="7"/%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <Tv2 className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-medium">{channel.name}</h3>
                    <p className="text-sm text-gray-500">{channel.group}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}