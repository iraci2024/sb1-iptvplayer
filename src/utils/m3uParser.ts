export interface M3UEntry {
  title: string;
  attributes: Record<string, string>;
  uri: string;
}

export async function parseM3U(url: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    
    const lines = text.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse the EXTINF line
        const matches = line.match(/^#EXTINF:-1\s*(.*?),(.*)$/);
        if (matches) {
          const [, attributes, title] = matches;
          
          // Parse attributes
          const attrs: Record<string, string> = {};
          const attrMatches = attributes.matchAll(/([^\s=]+)="([^"]*?)"/g);
          for (const match of attrMatches) {
            attrs[match[1]] = match[2];
          }

          currentChannel = {
            name: title.trim(),
            logo: attrs['tvg-logo'] || '',
            group: attrs['group-title'] || 'Sem categoria'
          };
        }
      } else if (line.startsWith('http') || line.startsWith('https')) {
        // This is the URL line
        if (currentChannel.name) {
          channels.push({
            name: currentChannel.name,
            url: line,
            logo: currentChannel.logo,
            group: currentChannel.group
          });
          currentChannel = {};
        }
      }
    }

    return channels;
  } catch (error) {
    console.error('Erro ao carregar lista:', error);
    throw new Error('Não foi possível carregar a lista de canais');
  }
}