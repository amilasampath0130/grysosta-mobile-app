import { useState, useEffect } from 'react';
import { GAMES_DATA, NEWS_DATA } from '@/constants/home';

export const useHomeData = () => {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState(GAMES_DATA);
  const [news, setNews] = useState(NEWS_DATA);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      // Here you would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };

    loadData();
  }, []);

  return { loading, games, news };
};