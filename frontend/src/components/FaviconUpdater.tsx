import { useSettings } from '../contexts/SettingsContext';
import { useFavicon } from '../hooks/useFavicon';
import { getAbsoluteUrl } from '../utils/urlUtils';

const FaviconUpdater: React.FC = () => {
  const { settings } = useSettings();
  
  useFavicon({ faviconUrl: getAbsoluteUrl(settings?.favicon_url) });

  return null; // This component doesn't render anything
};

export default FaviconUpdater; 