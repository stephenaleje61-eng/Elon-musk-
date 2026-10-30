import React, { useState, useEffect } from 'react';
import { ElonMuskSpaceVisitorView } from './components/ElonMuskSpaceVisitorView';
import { ElonMuskSpaceAdminView } from './components/ElonMuskSpaceAdminView';
import { ElonMuskSpaceAdminLogin } from './components/ElonMuskSpaceAdminLogin';
import {
  isCurrentAdminAuthenticated,
  subscribeToAdminAuthState,
} from './services/firebaseAuth';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      if (search.get('view') === 'admin' || search.get('page') === 'admin-login') {
        return '/admin-login';
      }
      if (search.get('view') === 'visitor') {
        return '/';
      }
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isCurrentAdminAuthenticated());

  // Listen to live Admin auth state changes
  useEffect(() => {
    const unsub = subscribeToAdminAuthState((authenticated) => {
      setIsAdmin(authenticated);
    });
    return () => unsub();
  }, []);

  const [visitorId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlId = new URLSearchParams(window.location.search).get('id');
        if (urlId && urlId.trim()) {
          localStorage.setItem('elonverse_visitor_id', urlId.trim());
          return urlId.trim();
        }
      }
      const saved =
        localStorage.getItem('elonverse_visitor_id') ||
        localStorage.getItem('elon_space_visitor_id');
      if (saved) return saved;
      const created =
        'vis-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
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

  // 1. Admin Login Route (/admin-login) - displays email and password form for elonmuskspace241@gmail.com
  if (currentRoute === '/admin-login') {
    return (
      <ElonMuskSpaceAdminLogin
        onLoginSuccess={() => navigateTo('/admin')}
        onBackToVisitor={() => navigateTo('/')}
      />
    );
  }

  // 2. Admin Control View (/admin, /owner, /space-owner) - LOCKED & PROTECTED
  if (currentRoute === '/admin' || currentRoute === '/owner' || currentRoute === '/space-owner') {
    if (!isAdmin) {
      // Task 4: If user tries to open /admin directly without login, redirect to /admin-login
      return (
        <ElonMuskSpaceAdminLogin
          onLoginSuccess={() => navigateTo('/admin')}
          onBackToVisitor={() => navigateTo('/')}
        />
      );
    }

    return (
      <ElonMuskSpaceAdminView
        onBackToVisitor={() => navigateTo('/')}
        onLogout={() => navigateTo('/admin-login')}
      />
    );
  }

  // 3. Default Visitor View (/) - Normal Clean Visitor Space
  return (
    <ElonMuskSpaceVisitorView
      visitorId={visitorId}
      onNavigateAdmin={() => navigateTo('/admin-login')}
    />
  );
}
