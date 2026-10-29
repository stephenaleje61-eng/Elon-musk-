import React, { useState, useEffect } from 'react';
import { ElonMuskSpaceVisitorView } from './components/ElonMuskSpaceVisitorView';
import { ElonMuskSpaceAdminView } from './components/ElonMuskSpaceAdminView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [visitorId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('elonverse_visitor_id');
      if (saved) return saved;
      const created = 'vis-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem('elonverse_visitor_id', created);
      return created;
    } catch {
      return 'vis-' + Math.random().toString(36).substring(2, 10);
    }
  });

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Admin Control View (/admin, /owner, /space-owner) - OPENS DIRECTLY, NO LOGIN
  if (currentRoute === '/admin' || currentRoute === '/owner' || currentRoute === '/space-owner') {
    return (
      <ElonMuskSpaceAdminView
        onBackToVisitor={() => navigateTo('/')}
      />
    );
  }

  // 2. Default Visitor View (/) - Pure Black and White Form & Private Chat
  return (
    <ElonMuskSpaceVisitorView
      visitorId={visitorId}
      onNavigateAdmin={() => navigateTo('/admin')}
    />
  );
}
