import React, { useState, useEffect, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelList } from './components/ChannelList';
import { parseM3U } from './utils/m3uParser';
import { Settings, Loader2, Tv2 } from 'lucide-react';
import type { Channel, PlaylistState } from './types';

const DEFAULT_PLAYLIST = 'https://raw.githubusercontent.com/iraci2024/iptv/refs/heads/main/iptv.m3u';

function App() {
  const [playlist, setPlaylist] = useState<PlaylistState>({
    url: DEFAULT_PLAYLIST,
    channels: [],
  });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');

  const loadPlaylist = useCallback(async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      const channels = await parseM3U(url);
      setPlaylist({ url, channels });
      if (channels.length > 0 && !selectedChannel) {
        setSelectedChannel(channels[0]);
      }
    } catch (err) {
      setError('Erro ao carregar a lista de canais. Verifique a URL e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChannel]);

  useEffect(() => {
    loadPlaylist(playlist.url);
  }, []);

  const handlePlaylistChange = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistUrl) {
      loadPlaylist(newPlaylistUrl);
      setShowSettings(false);
      setNewPlaylistUrl('');
    }
  }, [newPlaylistUrl, loadPlaylist]);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando canais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Web Player IPTV</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Configurações</h2>
            <form onSubmit={handlePlaylistChange}>
              <div className="flex gap-4">
                <input
                  type="url"
                  placeholder="Cole a URL da lista M3U aqui"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newPlaylistUrl}
                  onChange={(e) => setNewPlaylistUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Atualizar Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {selectedChannel ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <VideoPlayer url={selectedChannel.url} />
                <div className="p-4">
                  <h2 className="text-xl font-medium">{selectedChannel.name}</h2>
                  <p className="text-gray-500">{selectedChannel.group}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Tv2 className="w-16 h-16 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-600">Selecione um canal para começar</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)]">
            <ChannelList
              channels={playlist.channels}
              onChannelSelect={handleChannelSelect}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;