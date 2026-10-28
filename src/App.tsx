import React, { useState, useEffect } from 'react';
import { ElonverseHomePage } from './components/ElonverseHomePage';
import { DirectUserChatPage } from './components/DirectUserChatPage';
import { AdminChatDashboard } from './components/AdminChatDashboard';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlUser = params.get('user');
      if (urlUser) return urlUser;
      return localStorage.getItem('elonverse_user_name') || '';
    }
    return '';
  });

  const [userCity, setUserCity] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('elonverse_user_city') || 'Austin, TX';
    }
    return 'Austin, TX';
  });

  const [userId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('elonverse_direct_user_id');
      if (saved) return saved;
      const created = 'usr-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('elonverse_direct_user_id', created);
      return created;
    } catch {
      return 'usr-' + Math.random().toString(36).substring(2, 9);
    }
  });

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
      const params = new URLSearchParams(window.location.search);
      const u = params.get('user');
      if (u) setUserName(u);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, queryUser?: string, queryOrder?: string) => {
    const params = new URLSearchParams();
    if (queryUser) params.set('user', queryUser);
    if (queryOrder) params.set('order', queryOrder);
    const targetUrl = params.toString() ? `${path}?${params.toString()}` : path;
    window.history.pushState(null, '', targetUrl);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Admin Dashboard Route (/admin)
  if (currentRoute === '/admin') {
    return (
      <AdminChatDashboard
        onBackToUserChat={() => navigateTo('/chat', userName || 'Explorer')}
      />
    );
  }

  // 2. Direct Chat Route (/chat)
  if (currentRoute === '/chat') {
    return (
      <DirectUserChatPage
        userName={userName || 'Explorer'}
        userCity={userCity}
        userId={userId}
        onNavigateAdmin={() => navigateTo('/admin')}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // 3. Home Page (/) with ELON SPACE X Welcome Section at top + all empire features below
  return (
    <ElonverseHomePage
      userName={userName}
      userCity={userCity}
      userId={userId}
      onNavigateToChat={(enteredName, enteredCity, orderTitle) => {
        const finalName = enteredName?.trim() || userName || 'Explorer';
        const finalCity = enteredCity?.trim() || userCity || 'Austin, TX';
        setUserName(finalName);
        setUserCity(finalCity);
        try {
          localStorage.setItem('elonverse_user_name', finalName);
          localStorage.setItem('elonverse_user_city', finalCity);
        } catch {}
        navigateTo('/chat', finalName, orderTitle);
      }}
      onUpdateUserName={(newName) => {
        setUserName(newName);
        try {
          localStorage.setItem('elonverse_user_name', newName);
        } catch {}
      }}
    />
  );
}
