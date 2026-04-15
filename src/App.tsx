import React, { useState, useEffect, useRef } from 'react';
import { localDb } from './localDb';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserProfile, Category, Post, Comment, Document as DocType, Notification, LeaderboardEntry } from './types';
import {
  MessageSquare, BookOpen, Users, Plus, Search, Menu, X, Sparkles, Clock, Eye, Trophy,
  Star, FileText, Layout, Globe, Calendar, Heart, Share2, TrendingUp, Award, ChevronRight,
  ArrowLeft, Shield, Zap, LogOut, Crown, Medal, Bell, Download, Upload, File, Check,
  AlertCircle, CreditCard
} from 'lucide-react';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ usersCount: 0, postsCount: 0, commentsCount: 0, documentsCount: 0 });
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<string>('landing');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => { refreshAll(); }, []);
  useEffect(() => {
    if (profile) {
      const iv = setInterval(refreshAll, 3000);
      return () => clearInterval(iv);
    }
  }, [profile?.uid]);

  const refreshAll = () => {
    const cu = localDb.getCurrentUser();
    if (cu) { setProfile(cu); }
    setCategories(localDb.getCategories());
    setPosts(localDb.getPosts());
    setUsers(localDb.getUsers());
    setLeaderboard(localDb.getLeaderboard());
    setStats(localDb.getStats());
    setDocuments(localDb.getDocuments());
    if (cu) {
      setNotifications(localDb.getNotifications(cu.uid));
      setUnreadCount(localDb.getUnreadCount(cu.uid));
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    const found = localDb.getUsers().find(u => u.email === email);
    if (found) {
      localDb.setCurrentUser(found);
      setProfile(found);
      setShowAuthModal(false);
      setEmail(''); setPassword('');
      refreshAll();
    } else {
      setAuthError('Email не найден');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!displayName.trim()) { setAuthError('Введите имя'); return; }
    if (localDb.getUsers().find(u => u.email === email)) { setAuthError('Email занят'); return; }
    const newUser: UserProfile = {
      uid: Math.random().toString(36).substr(2, 9), displayName, email, role: 'student',
      points: 0, dailyActivity: {}, createdAt: new Date().toISOString(),
      isPremium: false, dailyDownloads: 0
    };
    localDb.setCurrentUser(newUser);
    localDb.addNotification(newUser.uid, 'system', 'Добро пожаловать!', `Привет, ${displayName}! Начни зарабатывать очки!`);
    setProfile(newUser);
    setShowAuthModal(false);
    setEmail(''); setPassword(''); setDisplayName('');
    refreshAll();
  };

  const handleLogout = () => { localDb.setCurrentUser(null); setProfile(null); setView('landing'); refreshAll(); };

  const createPost = (title: string, content: string, categoryId: string, isAnonymous: boolean) => {
    if (!profile) return;
    setIsPublishing(true);
    localDb.addPost({ title: title.trim(), content: content.trim(), authorId: profile.uid, authorName: isAnonymous ? 'Аноним' : profile.displayName, categoryId, isAnonymous });
    refreshAll();
    setView('forum');
    setIsPublishing(false);
  };

  const handleLike = (postId: string) => {
    if (!profile) { setShowAuthModal(true); return; }
    localDb.likePost(postId, profile.uid);
    refreshAll();
    if (selectedPost?.id === postId) {
      const up = localDb.getPosts().find(p => p.id === postId);
      if (up) setSelectedPost(up);
    }
  };

  const handleCommentAdded = () => { refreshAll(); };
  const handleMarkAllRead = () => { if (profile) { localDb.markAllRead(profile.uid); refreshAll(); } };
  const handleActivatePremium = (plan: 'monthly' | 'yearly') => {
    if (!profile) return;
    localDb.activatePremium(profile.uid, plan);
    refreshAll();
    setShowPremiumModal(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white"><BookOpen size={20} /></div>
              <span className="text-xl font-bold tracking-tighter">Douboi</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {[['landing', 'Главная'], ['forum', 'Форум'], ['documents', 'Материалы'], ['community', 'Люди и рейтинг']].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)} className={cn("text-sm font-medium transition-colors", view === v ? "text-black" : "text-zinc-500 hover:text-black")}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Поиск..." className="bg-zinc-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-48 focus:w-64 transition-all outline-none focus:ring-1 focus:ring-black" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {profile ? (
              <div className="flex items-center gap-3">
                {/* Bell */}
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-zinc-100 rounded-full">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 max-h-[400px] flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                          <span className="font-bold text-sm">Уведомления</span>
                          {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-blue-500 hover:underline">Прочитать все</button>}
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {notifications.length > 0 ? notifications.slice(0, 20).map(n => (
                            <div key={n.id} className={cn("px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer", !n.isRead && "bg-blue-50")} onClick={() => { if (!n.isRead) { localDb.markRead(n.id); refreshAll(); } }}>
                              <div className="flex items-start gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", n.type === 'like' ? "bg-red-100 text-red-500" : n.type === 'comment' ? "bg-blue-100 text-blue-500" : n.type === 'download' ? "bg-green-100 text-green-500" : n.type === 'premium' ? "bg-yellow-100 text-yellow-600" : "bg-zinc-100 text-zinc-500")}>
                                  {n.type === 'like' && <Heart size={14} />}{n.type === 'comment' && <MessageSquare size={14} />}{n.type === 'download' && <Download size={14} />}{n.type === 'premium' && <Crown size={14} />}{n.type === 'system' && <Bell size={14} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{n.title}</p>
                                  <p className="text-xs text-zinc-500 line-clamp-2">{n.message}</p>
                                  <p className="text-[10px] text-zinc-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ru })}</p>
                                </div>
                              </div>
                            </div>
                          )) : <div className="py-8 text-center text-zinc-400 text-sm">Нет уведомлений</div>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1"><p className="text-xs font-bold">{profile.displayName}</p>{profile.isPremium && <Crown size={12} className="text-yellow-500" />}</div>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end"><Trophy size={10} className="text-yellow-500" /> {profile.points} pts</p>
                </div>
                <div className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={cn("w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all", profile.isPremium ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : "bg-black text-white hover:bg-zinc-800")}>{profile.displayName[0].toUpperCase()}</button>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                          <p className="text-xs font-bold truncate flex items-center gap-1">{profile.displayName}{profile.isPremium && <Crown size={12} className="text-yellow-500" />}</p>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> {profile.points} очков</p>
                        </div>
                        <button onClick={() => { setSelectedUser(profile); setView('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-zinc-50 flex items-center gap-3"><Layout size={18} /> Мой профиль</button>
                        {!profile.isPremium && <button onClick={() => { setShowPremiumModal(true); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-zinc-50 flex items-center gap-3 text-yellow-600"><Crown size={18} /> Premium</button>}
                        <button onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-zinc-50 flex items-center gap-2"><LogOut size={16} /> Выйти</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"><Globe size={16} /> Войти</button>
            )}
            <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
          </div>
        </div>
      </nav>

      <main>
        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-2xl p-6 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <span className="text-xl font-black tracking-tighter uppercase">Меню</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex flex-col gap-4">
                {[['landing', 'Главная'], ['forum', 'Форум'], ['documents', 'Материалы'], ['community', 'Люди и рейтинг']].map(([v, l]) => (
                  <button key={v} onClick={() => { setView(v); setIsSidebarOpen(false); }} className={cn("text-left py-3 px-4 rounded-xl font-bold transition-all", view === v ? "bg-black text-white" : "text-zinc-500 hover:bg-zinc-100")}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <button onClick={() => setShowAuthModal(false)} className="absolute right-6 top-6 text-zinc-400 hover:text-black"><X size={24} /></button>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
              <p className="text-zinc-500 text-sm mb-8">{authMode === 'login' ? 'Рады видеть!' : 'Присоединяйся.'}</p>
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {authMode === 'register' && <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Имя</label><input type="text" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>}
                <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email</label><input type="email" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Пароль</label><input type="password" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black" value={password} onChange={e => setPassword(e.target.value)} /></div>
                {authError && <p className="text-red-500 text-xs font-bold ml-1">{authError}</p>}
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800">{authMode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
              </form>
              <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm font-bold text-zinc-400 hover:text-black">{authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Modal */}
        {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onActivate={handleActivatePremium} />}

        {view === 'landing' && <LandingView onStart={() => setView('forum')} stats={stats} leaderboard={leaderboard} onPremiumClick={() => profile ? setShowPremiumModal(true) : setShowAuthModal(true)} />}
        {view === 'forum' && <div className="max-w-7xl mx-auto px-4 py-8"><ForumView posts={posts} categories={categories} users={users} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} onPostClick={p => { setSelectedPost(p); setView('post'); }} onCreatePost={() => setView('create')} profile={profile} onLike={handleLike} stats={stats} leaderboard={leaderboard} onUserClick={u => { setSelectedUser(u); setView('profile'); }} /></div>}
        {view === 'create' && <div className="max-w-7xl mx-auto px-4 py-8"><CreatePostView categories={categories} onCancel={() => setView('forum')} onSubmit={createPost} isPublishing={isPublishing} /></div>}
        {view === 'post' && selectedPost && <div className="max-w-7xl mx-auto px-4 py-8"><PostDetailView post={selectedPost} onBack={() => setView('forum')} profile={profile} onLike={handleLike} onCommentAdded={handleCommentAdded} onUserClick={uid => { const u = users.find(x => x.uid === uid); if (u) { setSelectedUser(u); setView('profile'); } }} /></div>}
        {view === 'profile' && selectedUser && <div className="max-w-7xl mx-auto px-4 py-8"><ProfileView user={selectedUser} onBack={() => setView('forum')} isOwnProfile={profile?.uid === selectedUser.uid} onPostClick={p => { setSelectedPost(p); setView('post'); }} leaderboard={leaderboard} onPremiumClick={() => setShowPremiumModal(true)} /></div>}
        {view === 'documents' && <div className="max-w-7xl mx-auto px-4 py-8"><DocumentsView documents={documents} categories={categories} profile={profile} onRefresh={refreshAll} onLoginRequired={() => setShowAuthModal(true)} onPremiumRequired={() => setShowPremiumModal(true)} /></div>}
        {view === 'community' && <div className="max-w-7xl mx-auto px-4 py-8"><CommunityView users={users} leaderboard={leaderboard} onUserClick={u => { setSelectedUser(u); setView('profile'); }} /></div>}
      </main>
    </div>
  );
}

// ========== COMPONENTS ==========

function PremiumModal({ onClose, onActivate }: { onClose: () => void; onActivate: (plan: 'monthly' | 'yearly') => void }) {
  const [sel, setSel] = useState<'monthly' | 'yearly'>('monthly');
  const plans = [
    { id: 'monthly' as const, name: 'Месячный', price: 99, period: 'мес', features: ['Без лимита скачиваний', 'Premium материалы', 'Значок в профиле'] },
    { id: 'yearly' as const, name: 'Годовой', price: 999, period: 'год', discount: '2 мес бесплатно!', features: ['Всё из месячного', 'Скидка 17%', 'Эксклюзивные материалы'] }
  ];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-black"><X size={24} /></button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Crown size={32} className="text-white" /></div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Douboi Premium</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {plans.map(p => (
            <div key={p.id} onClick={() => setSel(p.id)} className={cn("rounded-2xl p-6 cursor-pointer transition-all border-2", sel === p.id ? "border-yellow-400 bg-yellow-50" : "border-zinc-200")}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">{p.name}</h3>{p.discount && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{p.discount}</span>}</div>
              <div className="flex items-baseline gap-1 mb-4"><span className="text-4xl font-black">{p.price}</span><span className="text-zinc-500">₽/{p.period}</span></div>
              <ul className="space-y-2">{p.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-zinc-600"><Check size={16} className="text-green-500" />{f}</li>)}</ul>
            </div>
          ))}
        </div>
        <button onClick={() => onActivate(sel)} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"><CreditCard size={20} />Активировать (демо)</button>
        <p className="text-center text-xs text-zinc-400 mt-3">Демо-версия. Оплата не взимается.</p>
      </div>
    </div>
  );
}

function LandingView({ onStart, stats, leaderboard, onPremiumClick }: { onStart: () => void; stats: any; leaderboard: LeaderboardEntry[]; onPremiumClick: () => void }) {
  return (
    <div className="space-y-0">
      <section className="hero-gradient text-white py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20"><Sparkles size={14} /> Платформа Douboi 2.0</div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]">УЧИСЬ <br /> вместе, <br /> ДОСТИГАЙ <br /> большего.</h1>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">Место, где студенты реально помогают друг другу. Конспекты, ответы на вопросы, подготовка к экзаменам — всё тут.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={onStart} className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 flex items-center gap-2 text-lg">Начать учиться <ChevronRight size={20} /></button>
              <button onClick={onPremiumClick} className="px-8 py-4 rounded-full font-bold border border-yellow-400/50 hover:bg-yellow-400/10 text-lg text-yellow-400 flex items-center gap-2"><Crown size={20} /> Premium</button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                {[{ icon: <Users size={32} />, val: stats.usersCount, label: 'Студентов' }, { icon: <MessageSquare size={32} />, val: stats.commentsCount, label: 'Обсуждений' }, { icon: <FileText size={32} />, val: stats.documentsCount, label: 'Материалов' }, { icon: <Trophy size={32} />, val: stats.postsCount, label: 'Тем на форуме' }].map((s, i) => (
                  <div key={i} className={cn("bg-white/5 p-6 rounded-2xl border border-white/10", i >= 2 && "mt-6")}><div className="text-zinc-400 mb-4">{s.icon}</div><h3 className="text-2xl font-bold">{s.val}+</h3><p className="text-zinc-500 text-sm">{s.label}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 team-section-bg">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Наша команда</h2>
          <p className="text-zinc-500">Мы просто хотим, чтобы учиться было проще.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[{ name: "Чан Нгок Минь", img: "https://picsum.photos/seed/minh/400/400" }, { name: "До Хю Хоанг", img: "https://picsum.photos/seed/hoang/400/400" }, { name: "Егор", img: "https://picsum.photos/seed/egor/400/400" }].map((m, i) => (
            <div key={i} className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-black transition-all">
              <img src={m.img} alt={m.name} className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="p-6 text-center"><h4 className="text-xl font-bold">{m.name}</h4></div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-black text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[{ icon: <Globe size={32} />, title: "Везде свои", desc: "Студенты со всей страны." }, { icon: <Shield size={32} />, title: "Всё честно", desc: "Данные под защитой. Без рекламы." }, { icon: <Zap size={32} />, title: "Быстро", desc: "Работает шустро." }, { icon: <Star size={32} />, title: "Без мусора", desc: "Модераторы следят. Спам удаляется." }].map((f, i) => (
            <div key={i} className="space-y-4"><div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">{f.icon}</div><h3 className="text-xl font-bold">{f.title}</h3><p className="text-zinc-500 text-sm">{f.desc}</p></div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-yellow-50 to-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 text-sm font-bold mb-6"><Crown size={16} /> Premium</div>
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Качай без лимитов</h2>
          <p className="text-zinc-500 max-w-xl mx-auto mb-8">С Premium качаешь сколько хочешь и открываешь закрытые материалы.</p>
          <button onClick={onPremiumClick} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 shadow-lg">Попробовать — от 99₽/мес</button>
        </div>
      </section>
    </div>
  );
}

function ForumView({ posts, categories, users, selectedCategory, setSelectedCategory, searchQuery, onPostClick, onCreatePost, profile, onLike, stats, leaderboard, onUserClick }: any) {
  const filtered = posts.filter((p: Post) => {
    const s = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const c = !selectedCategory || p.categoryId === selectedCategory;
    return s && c;
  });
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Разделы</h3>
          <div className="space-y-1">
            <button onClick={() => setSelectedCategory(null)} className={cn("w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left", !selectedCategory ? "bg-black text-white" : "text-zinc-500 hover:bg-zinc-100")}>Все темы</button>
            {categories.map((cat: Category) => <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={cn("w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left", selectedCategory === cat.id ? "bg-black text-white" : "text-zinc-500 hover:bg-zinc-100")}>{cat.name}</button>)}
          </div>
          {profile && <button onClick={onCreatePost} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 flex items-center justify-center gap-2"><Plus size={18} /> Создать тему</button>}
        </div>
        <div className="bg-zinc-900 text-white rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} /> Статистика</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Участников:</span><span className="font-bold">{stats.usersCount}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Тем:</span><span className="font-bold">{stats.postsCount}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Материалов:</span><span className="font-bold">{stats.documentsCount}</span></div>
          </div>
        </div>
        {leaderboard.length > 0 && (
          <div className="bg-gradient-to-b from-yellow-50 to-white border border-yellow-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-sm"><Crown size={16} className="text-yellow-500" /> Топ-5</h3>
            {leaderboard.slice(0, 5).map((u: LeaderboardEntry, i: number) => (
              <div key={u.uid} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className={cn("w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center", i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-zinc-300 text-black" : i === 2 ? "bg-orange-400 text-white" : "bg-zinc-100 text-zinc-500")}>{i + 1}</span><span className="font-medium truncate max-w-[100px]">{u.displayName}</span></div>
                <span className="text-zinc-500 text-xs">{u.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lg:col-span-9 space-y-8">
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="thread-list-header grid grid-cols-12 px-6 py-4"><div className="col-span-8">Тема</div><div className="col-span-2 text-center">Реакции</div><div className="col-span-2 text-right">Просмотры</div></div>
          <div className="divide-y divide-zinc-100">
            {filtered.map((post: Post) => (
              <div key={post.id} onClick={() => onPostClick(post)} className="thread-item-hover grid grid-cols-12 px-6 py-5 items-center">
                <div className="col-span-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-black font-bold shrink-0">{post.authorName[0].toUpperCase()}</div>
                  <div className="min-w-0"><h4 className="font-bold text-zinc-900 truncate mb-1">{post.title}</h4><p className="text-xs text-zinc-500">От {post.authorName} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}</p></div>
                </div>
                <div className="col-span-2 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">{post.likeCount}</span>
                  <button onClick={e => { e.stopPropagation(); onLike(post.id); }} className={cn("flex items-center gap-1 text-[10px] uppercase font-bold", profile?.likedPosts?.includes(post.id) ? "text-red-500" : "text-zinc-400 hover:text-black")}><Heart size={14} fill={profile?.likedPosts?.includes(post.id) ? "currentColor" : "none"} /> Лайк</button>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2 text-zinc-400"><Eye size={14} /><span className="text-xs font-bold">{post.viewCount}</span></div>
              </div>
            ))}
            {filtered.length === 0 && <div className="py-20 text-center text-zinc-500">Ничего не найдено.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePostView({ categories, onCancel, onSubmit, isPublishing }: { categories: Category[]; onCancel: () => void; onSubmit: (t: string, c: string, cat: string, a: boolean) => void; isPublishing: boolean }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [catId, setCatId] = useState('');
  const [anon, setAnon] = useState(false);
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 space-y-8">
      <div className="flex items-center gap-4"><button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full"><ArrowLeft size={24} /></button><h2 className="text-3xl font-black tracking-tighter uppercase">Новая тема</h2></div>
      <div className="space-y-2"><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Заголовок</label><input type="text" placeholder="О чём?" className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl py-4 px-6 outline-none font-bold text-lg" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="space-y-2"><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Раздел</label><select className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl py-4 px-6 outline-none font-bold" value={catId} onChange={e => setCatId(e.target.value)}><option value="">Выбери</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="space-y-2"><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Текст</label><textarea rows={10} placeholder="Подробнее..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-black rounded-2xl py-6 px-6 outline-none resize-none" value={content} onChange={e => setContent(e.target.value)} /></div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-500"><input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} /> Анонимно</label>
        <button disabled={!title || !content || !catId || isPublishing} onClick={() => onSubmit(title, content, catId, anon)} className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50">{isPublishing ? 'Публикуем...' : 'Опубликовать'}</button>
      </div>
    </div>
  );
}

function PostDetailView({ post, onBack, profile, onLike, onCommentAdded, onUserClick }: { post: Post; onBack: () => void; profile: UserProfile | null; onLike: (id: string) => void; onCommentAdded: () => void; onUserClick: (uid: string) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  useEffect(() => { setComments(localDb.getComments(post.id)); }, [post.id]);

  const handleAdd = () => {
    if (!profile || !newComment.trim()) return;
    localDb.addComment({ postId: post.id, content: newComment, authorId: profile.uid, authorName: profile.displayName });
    setComments(localDb.getComments(post.id));
    setNewComment('');
    onCommentAdded();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-black font-bold text-xs uppercase tracking-widest"><ArrowLeft size={16} /> Назад</button>
      <article className="bg-white p-8 md:p-16 rounded-3xl border border-zinc-200">
        <div className="flex items-center gap-4 mb-10">
          <div onClick={() => onUserClick(post.authorId)} className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white font-bold text-xl cursor-pointer">{post.authorName[0].toUpperCase()}</div>
          <div><h3 onClick={() => onUserClick(post.authorId)} className="font-bold text-lg hover:underline cursor-pointer">{post.authorName}</h3><p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}</p></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 leading-[1.1]">{post.title}</h1>
        <div className="text-lg leading-relaxed whitespace-pre-wrap mb-16 text-zinc-600">{post.content}</div>
        <div className="flex items-center gap-8 pt-10 border-t border-zinc-100">
          <button onClick={() => onLike(post.id)} className={cn("flex items-center gap-2 font-bold text-xs uppercase tracking-widest", profile?.likedPosts?.includes(post.id) ? "text-red-500" : "text-zinc-400 hover:text-black")}><Heart size={20} fill={profile?.likedPosts?.includes(post.id) ? "currentColor" : "none"} /> {post.likeCount} Нравится</button>
          <span className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest"><MessageSquare size={20} /> {post.commentCount} Комментарии</span>
        </div>
      </article>
      <h3 className="text-2xl font-black tracking-tighter uppercase">Обсуждение <span className="text-zinc-300">({comments.length})</span></h3>
      {profile ? (
        <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 flex gap-6">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold shrink-0">{profile.displayName[0].toUpperCase()}</div>
          <div className="flex-1 space-y-4">
            <textarea placeholder="Что думаешь?" className="w-full bg-white border border-zinc-200 rounded-2xl py-4 px-6 outline-none focus:border-black resize-none min-h-[120px]" value={newComment} onChange={e => setNewComment(e.target.value)} />
            <div className="flex justify-end"><button disabled={!newComment.trim()} onClick={handleAdd} className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50">Отправить</button></div>
          </div>
        </div>
      ) : <div className="bg-zinc-100 p-12 rounded-3xl border-dashed border border-zinc-300 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm">Войди, чтобы комментировать.</div>}
      <div className="space-y-6">
        {[...comments].reverse().map(c => (
          <div key={c.id} className="bg-white p-8 rounded-3xl border border-zinc-100 flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center font-bold shrink-0">{c.authorName[0].toUpperCase()}</div>
            <div className="space-y-2"><div className="flex items-center gap-3"><span className="font-bold">{c.authorName}</span><span className="text-[10px] text-zinc-400">• {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ru })}</span></div><p className="text-zinc-600 text-lg">{c.content}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsView({ documents, categories, profile, onRefresh, onLoginRequired, onPremiumRequired }: { documents: DocType[]; categories: Category[]; profile: UserProfile | null; onRefresh: () => void; onLoginRequired: () => void; onPremiumRequired: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCatId, setUploadCatId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPrice, setUploadPrice] = useState(0);
  const [uploadPremium, setUploadPremium] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [error, setError] = useState('');

  const filtered = documents.filter(d => {
    const s = d.title.toLowerCase().includes(searchQ.toLowerCase());
    const c = !filterCat || d.categoryId === filterCat;
    return s && c;
  });

  const handleUpload = async () => {
    if (!profile || !uploadFile) return;
    let dataUrl: string | undefined;
    if (uploadFile.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      dataUrl = await new Promise<string>(r => { reader.onload = () => r(reader.result as string); reader.readAsDataURL(uploadFile); });
    }
    localDb.addDocument({ title: uploadTitle || uploadFile.name, description: uploadDesc, filename: uploadFile.name, fileSize: uploadFile.size, authorId: profile.uid, authorName: profile.displayName, categoryId: uploadCatId, price: uploadPrice, isPremiumOnly: uploadPremium, dataUrl });
    setShowUpload(false); setUploadTitle(''); setUploadDesc(''); setUploadCatId(''); setUploadFile(null); setUploadPrice(0); setUploadPremium(false);
    onRefresh();
  };

  const handleDownload = (doc: DocType) => {
    if (!profile) { onLoginRequired(); return; }
    const res = localDb.downloadDocument(doc.id, profile.uid);
    if (!res.success) { if (res.error?.includes('Premium')) onPremiumRequired(); else { setError(res.error || ''); setTimeout(() => setError(''), 5000); } return; }
    if (res.dataUrl) { const a = document.createElement('a'); a.href = res.dataUrl; a.download = doc.filename; a.click(); }
    onRefresh();
  };

  const fmtSize = (b: number) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h2 className="text-3xl font-black tracking-tighter uppercase">Материалы</h2><p className="text-zinc-500">Конспекты, экзамены, шпаргалки — всё в одном месте.</p></div>
        {profile && <button onClick={() => setShowUpload(true)} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Upload size={18} /> Загрузить PDF</button>}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowUpload(false)} className="absolute right-6 top-6 text-zinc-400 hover:text-black"><X size={24} /></button>
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-6">Загрузить материал</h3>
            <div className="space-y-4">
              <div><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">PDF файл</label><input type="file" accept=".pdf" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4" /></div>
              <div><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Название</label><input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black" /></div>
              <div><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Описание</label><textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black resize-none" rows={3} /></div>
              <div><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Раздел</label><select value={uploadCatId} onChange={e => setUploadCatId(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black"><option value="">Выбери</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Цена (₽)</label><input type="number" min="0" value={uploadPrice} onChange={e => setUploadPrice(parseInt(e.target.value) || 0)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 outline-none focus:border-black" /></div>
                <div className="flex items-end pb-3"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={uploadPremium} onChange={e => setUploadPremium(e.target.checked)} className="w-4 h-4" /><span className="text-sm font-medium">Только Premium</span></label></div>
              </div>
              <button onClick={handleUpload} disabled={!uploadFile} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2"><Upload size={18} /> Загрузить (+10 очков)</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} /><input type="text" placeholder="Поиск..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full bg-zinc-100 border-none rounded-full py-2 pl-10 pr-4 text-sm outline-none" /></div>
        <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value || null)} className="bg-zinc-100 border-none rounded-full py-2 px-4 text-sm outline-none"><option value="">Все разделы</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-black transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all"><File size={24} /></div>
              <div className="flex items-center gap-2">{doc.isPremiumOnly && <Crown size={16} className="text-yellow-500" />}{doc.price > 0 && <span className="text-xs font-bold text-green-600">{doc.price}₽</span>}</div>
            </div>
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{doc.title}</h3>
            {doc.description && <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{doc.description}</p>}
            <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-widest mb-4"><span>PDF • {fmtSize(doc.fileSize)}</span><span className="flex items-center gap-1"><Download size={12} /> {doc.downloadCount}</span></div>
            <button onClick={() => handleDownload(doc)} className="w-full bg-zinc-100 hover:bg-black hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"><Download size={16} /> Скачать</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-20 text-center text-zinc-500"><FileText className="w-16 h-16 mx-auto mb-4 text-zinc-300" /><p className="font-bold">Пусто</p></div>}
      </div>
    </div>
  );
}

function CommunityView({ users, leaderboard, onUserClick }: { users: UserProfile[]; leaderboard: LeaderboardEntry[]; onUserClick: (u: UserProfile) => void }) {
  const [tab, setTab] = useState<'ranking' | 'people' | 'events'>('ranking');
  const getRankBg = (r: number) => r === 1 ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300" : r === 2 ? "bg-gradient-to-r from-zinc-50 to-zinc-100 border-zinc-300" : r === 3 ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300" : "bg-white border-zinc-200";
  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 text-white rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2"><Sparkles size={18} /> За что дают очки</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ icon: <FileText className="text-yellow-400" size={18} />, bg: "bg-yellow-500/20", pts: "+5", lbl: "Новая тема" }, { icon: <MessageSquare className="text-blue-400" size={18} />, bg: "bg-blue-500/20", pts: "+2", lbl: "Комментарий" }, { icon: <Heart className="text-red-400" size={18} />, bg: "bg-red-500/20", pts: "+10", lbl: "Лайк на пост" }, { icon: <Upload className="text-green-400" size={18} />, bg: "bg-green-500/20", pts: "+10", lbl: "Загрузка PDF" }].map((x, i) => (
            <div key={i} className="flex items-center gap-3"><div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", x.bg)}>{x.icon}</div><div><p className="font-bold text-sm">{x.pts}</p><p className="text-zinc-400 text-xs">{x.lbl}</p></div></div>
          ))}
        </div>
      </div>
      <div className="flex gap-6 border-b border-zinc-200">
        {[['ranking', 'Рейтинг', <Trophy size={16} key="t" />], ['people', `Участники (${users.length})`, <Users size={16} key="u" />], ['events', 'События', <Calendar size={16} key="c" />]].map(([v, l, icon]) => (
          <button key={v as string} onClick={() => setTab(v as any)} className={cn("pb-3 text-sm font-bold uppercase tracking-widest transition-all relative flex items-center gap-1", tab === v ? "text-black" : "text-zinc-400 hover:text-black")}>{icon}{l as string}{tab === v && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}</button>
        ))}
      </div>
      {tab === 'ranking' && (
        <div className="space-y-3">
          {leaderboard.map(u => {
            const full = users.find(x => x.uid === u.uid);
            return (
              <div key={u.uid} onClick={() => full && onUserClick(full)} className={cn("rounded-2xl border p-5 flex items-center gap-5 cursor-pointer hover:shadow-md transition-all", getRankBg(u.rank))}>
                <div className="w-10 flex items-center justify-center">{u.rank <= 3 ? (u.rank === 1 ? <Crown className="text-yellow-500" size={20} /> : <Medal className={u.rank === 2 ? "text-zinc-400" : "text-orange-500"} size={20} />) : <span className="text-sm font-bold text-zinc-400">#{u.rank}</span>}</div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold", u.rank === 1 ? "bg-yellow-400 text-black" : u.rank === 2 ? "bg-zinc-400 text-black" : u.rank === 3 ? "bg-orange-400 text-white" : "bg-black text-white")}>{u.displayName[0].toUpperCase()}</div>
                <div className="flex-1"><h3 className="font-bold flex items-center gap-2">{u.displayName}{u.isPremium && <Crown size={14} className="text-yellow-500" />}</h3><p className="text-zinc-500 text-sm">{u.postsCount} тем, {u.commentsCount} комментариев</p></div>
                <div className="text-right"><p className="text-xl font-black">{u.points}</p><p className="text-zinc-400 text-[10px] uppercase tracking-widest">очков</p></div>
              </div>
            );
          })}
          {leaderboard.length === 0 && <div className="text-center py-16 text-zinc-500"><Trophy className="w-12 h-12 mx-auto mb-3 text-zinc-300" /><p className="font-bold">Пока пусто</p></div>}
        </div>
      )}
      {tab === 'people' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.uid} onClick={() => onUserClick(u)} className="p-5 border border-zinc-100 rounded-xl hover:bg-zinc-50 flex items-center gap-4 cursor-pointer">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg", u.isPremium ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : "bg-black text-white")}>{u.displayName[0].toUpperCase()}</div>
              <div className="flex-1"><h4 className="font-bold flex items-center gap-1 truncate">{u.displayName}{u.isPremium && <Crown size={14} className="text-yellow-500" />}</h4><p className="text-xs text-zinc-500">{u.role === 'admin' ? 'Админ' : 'Студент'}</p></div>
              <div className="text-right"><p className="font-bold text-yellow-600">{u.points}</p><p className="text-[10px] text-zinc-400">очков</p></div>
            </div>
          ))}
        </div>
      )}
      {tab === 'events' && (
        <div className="space-y-4">
          {[{ title: "Воркшоп: Как стать веб-разработчиком", date: "20/03", loc: "Актовый зал" }, { title: "Конкурс: Code Challenge 2024", date: "25/03", loc: "Онлайн" }, { title: "Семинар: ИИ в учебе", date: "02/04", loc: "Аудитория 201" }].map((ev, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-zinc-50 rounded-xl">
              <div className="flex items-center gap-4"><div className="w-14 h-14 bg-white rounded-lg flex flex-col items-center justify-center border border-zinc-200"><span className="text-xl font-black leading-none">{ev.date.split('/')[0]}</span><span className="text-[10px] font-bold text-zinc-400">{ev.date.split('/')[1]}</span></div><div><h4 className="font-bold">{ev.title}</h4><p className="text-xs text-zinc-500">{ev.loc}</p></div></div>
              <button className="text-xs font-bold uppercase tracking-widest hover:underline">Участвовать</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileView({ user, isOwnProfile, onBack, onPostClick, leaderboard, onPremiumClick }: { user: UserProfile; isOwnProfile: boolean; onBack: () => void; onPostClick: (p: Post) => void; leaderboard: LeaderboardEntry[]; onPremiumClick: () => void }) {
  const [tab, setTab] = useState<'posts' | 'comments'>('posts');
  const userPosts = localDb.getUserPosts(user.uid);
  const userComments = localDb.getUserComments(user.uid);
  const userRank = leaderboard.find(l => l.uid === user.uid)?.rank || '-';
  const last90 = Array.from({ length: 90 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (89 - i)); return d.toISOString().split('T')[0]; });
  const actColor = (c: number) => c === 0 ? 'bg-zinc-100' : c < 3 ? 'bg-emerald-200' : c < 6 ? 'bg-emerald-400' : 'bg-emerald-600';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-black font-bold text-xs uppercase tracking-widest"><ArrowLeft size={16} /> Назад</button>
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
        <div className={cn("h-32 relative", user.isPremium ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-zinc-900")}>
          <div className="absolute -bottom-12 left-8"><div className={cn("w-24 h-24 rounded-3xl border-4 border-white flex items-center justify-center text-white font-black text-4xl shadow-xl", user.isPremium ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-black")}>{user.displayName[0].toUpperCase()}</div></div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-2">{user.displayName}{user.isPremium && <Crown size={24} className="text-yellow-500" />}</h2>
            <p className="text-zinc-500">{user.bio || "О себе пока ничего."}</p>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400"><span className="flex items-center gap-1"><Calendar size={14} /> С {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-b from-yellow-50 to-white px-6 py-3 rounded-2xl border border-yellow-200 text-center"><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Место</p><p className="text-2xl font-black flex items-center justify-center gap-2"><Crown size={20} className="text-yellow-500" /> #{userRank}</p></div>
            <div className="bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100 text-center"><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Очков</p><p className="text-2xl font-black flex items-center justify-center gap-2"><Trophy size={20} className="text-yellow-500" /> {user.points}</p></div>
            {isOwnProfile && !user.isPremium && <button onClick={onPremiumClick} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Crown size={18} /> Premium</button>}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-6">
        <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2"><TrendingUp size={20} /> Активность</h3>
        <div className="overflow-x-auto pb-4"><div className="flex gap-1 min-w-max">{last90.map(d => <div key={d} title={`${d}: ${user.dailyActivity?.[d] || 0}`} className={cn("w-3 h-3 rounded-sm transition-all hover:scale-150 cursor-pointer", actColor(user.dailyActivity?.[d] || 0))} />)}</div></div>
      </div>

      <div className="flex gap-8 border-b border-zinc-100">
        {[['posts', `Посты (${userPosts.length})`], ['comments', `Комментарии (${userComments.length})`]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v as any)} className={cn("pb-4 text-sm font-bold uppercase tracking-widest relative", tab === v ? "text-black" : "text-zinc-400 hover:text-black")}>{l}{tab === v && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}</button>
        ))}
      </div>
      <div className="space-y-4">
        {tab === 'posts' ? (userPosts.length > 0 ? userPosts.map(p => (
          <div key={p.id} onClick={() => onPostClick(p)} className="bg-white p-6 rounded-2xl border border-zinc-100 hover:border-zinc-300 cursor-pointer group">
            <h4 className="font-bold text-lg group-hover:underline mb-2">{p.title}</h4>
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-bold uppercase tracking-widest"><span className="flex items-center gap-1"><Heart size={12} /> {p.likeCount}</span><span className="flex items-center gap-1"><MessageSquare size={12} /> {p.commentCount}</span></div>
          </div>
        )) : <div className="py-12 text-center text-zinc-400">Пока нет постов.</div>) : (userComments.length > 0 ? userComments.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-zinc-100"><p className="text-zinc-600">{c.content}</p><p className="text-[10px] text-zinc-400 mt-2">{new Date(c.createdAt).toLocaleDateString('ru-RU')}</p></div>
        )) : <div className="py-12 text-center text-zinc-400">Комментариев нет.</div>)}
      </div>
    </div>
  );
}

