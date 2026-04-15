// import { UserProfile, Category, Post, Comment } from './types';

// // Mock data for initial load
// const INITIAL_CATEGORIES: Category[] = [
//   { id: '1', name: 'Математика', description: 'Обсуждаем задачи, формулы и теоремы. Без паники, всё решаемо.', icon: 'Hash' },
//   { id: '2', name: 'Литература', description: 'Разбираем классику, учимся писать эссе и спорим о смыслах.', icon: 'BookOpen' },
//   { id: '3', name: 'Английский', description: 'Учим слова, разбираемся в грамматике и просто болтаем.', icon: 'Globe' },
//   { id: '4', name: 'Физика', description: 'О том, как устроен этот мир. От механики до квантов.', icon: 'Zap' },
//   { id: '5', name: 'Химия', description: 'Реакции, таблица Менделеева и почему это всё-таки интересно.', icon: 'Award' },
// ];

// const INITIAL_POSTS: Post[] = [
//   {
//     id: 'p1',
//     title: 'Как подружиться со стереометрией в 11 классе?',
//     content: 'Никак не могу представить эти фигуры в пространстве. Есть какие-нибудь лайфхаки или хорошие видео?',
//     authorId: 'u1',
//     authorName: 'Иван Иванов',
//     categoryId: '1',
//     createdAt: new Date(Date.now() - 3600000).toISOString(),
//     updatedAt: new Date(Date.now() - 3600000).toISOString(),
//     viewCount: 120,
//     commentCount: 5,
//     likeCount: 15,
//     isAnonymous: false
//   },
//   {
//     id: 'p2',
//     title: 'Где брать нормальные варианты ЕГЭ по английскому?',
//     content: 'Собрал для вас список сайтов и сборников, которые реально помогают подготовиться.',
//     authorId: 'u2',
//     authorName: 'Мария Петрова',
//     categoryId: '3',
//     createdAt: new Date(Date.now() - 7200000).toISOString(),
//     updatedAt: new Date(Date.now() - 7200000).toISOString(),
//     viewCount: 450,
//     commentCount: 12,
//     likeCount: 42,
//     isAnonymous: false
//   }
// ];

// const INITIAL_USERS: UserProfile[] = [
//   { 
//     uid: 'u1', 
//     displayName: 'Иван Иванов', 
//     email: 'ivan@example.com', 
//     role: 'student', 
//     points: 150,
//     dailyActivity: {
//       '2026-03-10': 5,
//       '2026-03-11': 2,
//       '2026-03-12': 8,
//       '2026-03-15': 3,
//       '2026-03-18': 1
//     },
//     createdAt: new Date(Date.now() - 86400000 * 10).toISOString() 
//   },
//   { 
//     uid: 'u2', 
//     displayName: 'Мария Петрова', 
//     email: 'maria@example.com', 
//     role: 'student', 
//     points: 420,
//     dailyActivity: {
//       '2026-03-14': 10,
//       '2026-03-15': 15,
//       '2026-03-16': 5,
//       '2026-03-17': 2,
//       '2026-03-18': 4
//     },
//     createdAt: new Date(Date.now() - 86400000 * 5).toISOString() 
//   },
//   { 
//     uid: 'u3', 
//     displayName: 'Алексей Смирнов', 
//     email: 'alex@example.com', 
//     role: 'student', 
//     points: 50,
//     dailyActivity: {
//       '2026-03-17': 1,
//       '2026-03-18': 2
//     },
//     createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
//   },
// ];

// class LocalDatabase {
//   private getStorageItem<T>(key: string, defaultValue: T): T {
//     const item = localStorage.getItem(key);
//     return item ? JSON.parse(item) : defaultValue;
//   }

//   private setStorageItem<T>(key: string, value: T): void {
//     localStorage.setItem(key, JSON.stringify(value));
//   }

//   // Auth
//   getCurrentUser(): UserProfile | null {
//     return this.getStorageItem<UserProfile | null>('currentUser', null);
//   }

//   setCurrentUser(user: UserProfile | null): void {
//     this.setStorageItem('currentUser', user);
//     if (user) {
//       const users = this.getUsers();
//       if (!users.find(u => u.uid === user.uid)) {
//         const newUser = {
//           ...user,
//           points: user.points || 0,
//           dailyActivity: user.dailyActivity || {}
//         };
//         this.setStorageItem('users', [...users, newUser]);
//       }
//       this.trackActivity(user.uid);
//     }
//   }

//   trackActivity(userId: string): void {
//     const users = this.getUsers();
//     const userIndex = users.findIndex(u => u.uid === userId);
//     if (userIndex !== -1) {
//       const user = users[userIndex];
//       const today = new Date().toISOString().split('T')[0];
//       user.dailyActivity = user.dailyActivity || {};
//       user.dailyActivity[today] = (user.dailyActivity[today] || 0) + 1;
      
//       this.setStorageItem('users', users);
      
//       const currentUser = this.getCurrentUser();
//       if (currentUser && currentUser.uid === userId) {
//         this.setStorageItem('currentUser', user);
//       }
//     }
//   }

//   getUsers(): UserProfile[] {
//     const users = this.getStorageItem<UserProfile[]>('users', INITIAL_USERS);
//     return users.map(u => ({
//       ...u,
//       points: typeof u.points === 'number' ? u.points : 0,
//       dailyActivity: u.dailyActivity || {}
//     }));
//   }

//   // Categories
//   getCategories(): Category[] {
//     return this.getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
//   }

//   // Posts
//   getPosts(): Post[] {
//     const posts = this.getStorageItem<Post[]>('posts', INITIAL_POSTS);
//     return posts.map(p => ({
//       ...p,
//       likeCount: typeof p.likeCount === 'number' ? p.likeCount : 0,
//       commentCount: typeof p.commentCount === 'number' ? p.commentCount : 0,
//       viewCount: typeof p.viewCount === 'number' ? p.viewCount : 0
//     }));
//   }

//   addPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'commentCount' | 'likeCount'>): Post {
//     const posts = this.getPosts();
//     const newPost: Post = {
//       ...post,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       viewCount: 0,
//       commentCount: 0,
//       likeCount: 0
//     };
//     this.setStorageItem('posts', [newPost, ...posts]);
    
//     // Activity tracking
//     this.trackActivity(post.authorId);
    
//     return newPost;
//   }

//   likePost(postId: string, userId: string): void {
//     const posts = this.getPosts();
//     const postIndex = posts.findIndex(p => p.id === postId);
//     if (postIndex !== -1) {
//       const users = this.getUsers();
//       const userIndex = users.findIndex(u => u.uid === userId);
//       if (userIndex !== -1) {
//         const user = users[userIndex];
//         const likedPosts = user.likedPosts || [];
//         const post = posts[postIndex];
        
//         // Ensure likeCount exists
//         if (typeof post.likeCount !== 'number') {
//           post.likeCount = 0;
//         }

//         const authorIndex = users.findIndex(u => u.uid === post.authorId);

//         if (likedPosts.includes(postId)) {
//           // Unlike
//           user.likedPosts = likedPosts.filter(id => id !== postId);
//           post.likeCount = Math.max(0, post.likeCount - 1);
//           // Deduct points from author (10 points per like)
//           if (authorIndex !== -1) {
//             users[authorIndex].points = Math.max(0, (users[authorIndex].points || 0) - 10);
//           }
//         } else {
//           // Like
//           user.likedPosts = [...likedPosts, postId];
//           post.likeCount += 1;
//           // Add points to author (10 points per like)
//           if (authorIndex !== -1) {
//             users[authorIndex].points = (users[authorIndex].points || 0) + 10;
//           }
//         }
        
//         this.setStorageItem('users', users);
//         this.setStorageItem('posts', posts);
        
//         // Update current user if it's the one who liked
//         const currentUser = this.getCurrentUser();
//         if (currentUser && currentUser.uid === userId) {
//           this.setCurrentUser(users[userIndex]);
//         }
//       }
//     }
//   }

//   isPostLiked(postId: string, userId: string): boolean {
//     const users = this.getUsers();
//     const user = users.find(u => u.uid === userId);
//     return user?.likedPosts?.includes(postId) || false;
//   }

//   // Comments
//   getComments(postId: string): Comment[] {
//     const allComments = this.getStorageItem<Comment[]>('comments', []);
//     return allComments.filter(c => c.postId === postId);
//   }

//   addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
//     const allComments = this.getStorageItem<Comment[]>('comments', []);
//     const newComment: Comment = {
//       ...comment,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date().toISOString()
//     };
//     this.setStorageItem('comments', [...allComments, newComment]);
    
//     // Update post comment count
//     const posts = this.getPosts();
//     const postIndex = posts.findIndex(p => p.id === comment.postId);
//     if (postIndex !== -1) {
//       posts[postIndex].commentCount += 1;
//       this.setStorageItem('posts', posts);
//     }

//     // Activity tracking
//     this.trackActivity(comment.authorId);
    
//     return newComment;
//   }

//   getUserPosts(userId: string): Post[] {
//     return this.getPosts().filter(p => p.authorId === userId);
//   }

//   getUserComments(userId: string): Comment[] {
//     const allComments = this.getStorageItem<Comment[]>('comments', []);
//     return allComments.filter(c => c.authorId === userId);
//   }
// }

// export const localDb = new LocalDatabase();
import { UserProfile, Category, Post, Comment, Document, Notification, LeaderboardEntry } from './types';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Математика', description: 'Обсуждаем задачи, формулы и теоремы.', icon: 'Hash' },
  { id: '2', name: 'Литература', description: 'Разбираем классику, учимся писать эссе.', icon: 'BookOpen' },
  { id: '3', name: 'Английский', description: 'Учим слова, разбираемся в грамматике.', icon: 'Globe' },
  { id: '4', name: 'Физика', description: 'О том, как устроен этот мир.', icon: 'Zap' },
  { id: '5', name: 'Химия', description: 'Реакции, таблица Менделеева.', icon: 'Award' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Как подружиться со стереометрией в 11 классе?',
    content: 'Никак не могу представить эти фигуры в пространстве. Есть какие-нибудь лайфхаки или хорошие видео?',
    authorId: 'u1', authorName: 'Иван Иванов', categoryId: '1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    viewCount: 120, commentCount: 5, likeCount: 15, isAnonymous: false
  },
  {
    id: 'p2',
    title: 'Где брать нормальные варианты ЕГЭ по английскому?',
    content: 'Собрал для вас список сайтов и сборников, которые реально помогают подготовиться.',
    authorId: 'u2', authorName: 'Мария Петрова', categoryId: '3',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    viewCount: 450, commentCount: 12, likeCount: 42, isAnonymous: false
  }
];

const INITIAL_USERS: UserProfile[] = [
  { uid: 'u1', displayName: 'Иван Иванов', email: 'ivan@example.com', role: 'student', points: 150,
    dailyActivity: { '2026-03-10': 5, '2026-03-11': 2, '2026-03-12': 8, '2026-03-15': 3 },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), isPremium: false, dailyDownloads: 0 },
  { uid: 'u2', displayName: 'Мария Петрова', email: 'maria@example.com', role: 'student', points: 420,
    dailyActivity: { '2026-03-14': 10, '2026-03-15': 15, '2026-03-16': 5, '2026-03-17': 2 },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), isPremium: false, dailyDownloads: 0 },
  { uid: 'u3', displayName: 'Алексей Смирнов', email: 'alex@example.com', role: 'student', points: 50,
    dailyActivity: { '2026-03-17': 1, '2026-03-18': 2 },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), isPremium: false, dailyDownloads: 0 },
];

const FREE_DAILY_DOWNLOADS = 5;

class LocalDatabase {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ========== AUTH ==========
  getCurrentUser(): UserProfile | null {
    return this.getStorageItem<UserProfile | null>('currentUser', null);
  }

  setCurrentUser(user: UserProfile | null): void {
    this.setStorageItem('currentUser', user);
    if (user) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.uid === user.uid);
      if (idx === -1) {
        this.setStorageItem('users', [...users, user]);
      } else {
        users[idx] = user;
        this.setStorageItem('users', users);
      }
      this.trackActivity(user.uid);
    }
  }

  trackActivity(userId: string): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === userId);
    if (idx !== -1) {
      const today = new Date().toISOString().split('T')[0];
      users[idx].dailyActivity = users[idx].dailyActivity || {};
      users[idx].dailyActivity[today] = (users[idx].dailyActivity[today] || 0) + 1;
      this.setStorageItem('users', users);
      const cu = this.getCurrentUser();
      if (cu && cu.uid === userId) this.setStorageItem('currentUser', users[idx]);
    }
  }

  getUsers(): UserProfile[] {
    return this.getStorageItem<UserProfile[]>('users', INITIAL_USERS).map(u => ({
      ...u, points: u.points || 0, dailyActivity: u.dailyActivity || {},
      isPremium: u.isPremium || false, dailyDownloads: u.dailyDownloads || 0
    }));
  }

  updateUserPoints(uid: string, delta: number): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx].points = Math.max(0, (users[idx].points || 0) + delta);
      this.setStorageItem('users', users);
      const cu = this.getCurrentUser();
      if (cu && cu.uid === uid) this.setStorageItem('currentUser', users[idx]);
    }
  }

  // ========== CATEGORIES ==========
  getCategories(): Category[] {
    return this.getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
  }

  // ========== POSTS ==========
  getPosts(): Post[] {
    return this.getStorageItem<Post[]>('posts', INITIAL_POSTS).map(p => ({
      ...p, likeCount: p.likeCount || 0, commentCount: p.commentCount || 0, viewCount: p.viewCount || 0
    }));
  }

  addPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'commentCount' | 'likeCount'>): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      ...post, id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      viewCount: 0, commentCount: 0, likeCount: 0
    };
    this.setStorageItem('posts', [newPost, ...posts]);
    this.updateUserPoints(post.authorId, 5);
    this.trackActivity(post.authorId);
    this.addNotification(post.authorId, 'system', 'Тема опубликована!', `Ваша тема «${newPost.title}» опубликована. +5 очков!`);
    return newPost;
  }

  likePost(postId: string, userId: string): void {
    const posts = this.getPosts();
    const pi = posts.findIndex(p => p.id === postId);
    if (pi === -1) return;
    const users = this.getUsers();
    const ui = users.findIndex(u => u.uid === userId);
    if (ui === -1) return;
    const liked = users[ui].likedPosts || [];
    const authorIdx = users.findIndex(u => u.uid === posts[pi].authorId);

    if (liked.includes(postId)) {
      users[ui].likedPosts = liked.filter(id => id !== postId);
      posts[pi].likeCount = Math.max(0, posts[pi].likeCount - 1);
      if (authorIdx !== -1 && posts[pi].authorId !== userId) users[authorIdx].points = Math.max(0, users[authorIdx].points - 10);
    } else {
      users[ui].likedPosts = [...liked, postId];
      posts[pi].likeCount += 1;
      if (authorIdx !== -1 && posts[pi].authorId !== userId) {
        users[authorIdx].points += 10;
        this.addNotification(posts[pi].authorId, 'like', 'Новый лайк!', `${users[ui].displayName} оценил тему «${posts[pi].title}». +10 очков!`);
      }
    }
    this.setStorageItem('users', users);
    this.setStorageItem('posts', posts);
    const cu = this.getCurrentUser();
    if (cu && cu.uid === userId) this.setStorageItem('currentUser', users[ui]);
  }

  // ========== COMMENTS ==========
  getComments(postId: string): Comment[] {
    return this.getStorageItem<Comment[]>('comments', []).filter(c => c.postId === postId);
  }

  addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const all = this.getStorageItem<Comment[]>('comments', []);
    const newComment: Comment = { ...comment, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    this.setStorageItem('comments', [...all, newComment]);
    const posts = this.getPosts();
    const pi = posts.findIndex(p => p.id === comment.postId);
    if (pi !== -1) {
      posts[pi].commentCount += 1;
      this.setStorageItem('posts', posts);
      if (posts[pi].authorId !== comment.authorId) {
        this.addNotification(posts[pi].authorId, 'comment', 'Новый комментарий!', `${comment.authorName} ответил на тему «${posts[pi].title}»`);
      }
    }
    this.updateUserPoints(comment.authorId, 2);
    this.trackActivity(comment.authorId);
    return newComment;
  }

  getUserPosts(userId: string): Post[] { return this.getPosts().filter(p => p.authorId === userId); }
  getUserComments(userId: string): Comment[] { return this.getStorageItem<Comment[]>('comments', []).filter(c => c.authorId === userId); }

  // ========== DOCUMENTS ==========
  getDocuments(): Document[] {
    return this.getStorageItem<Document[]>('documents', []);
  }

  addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'downloadCount'>): Document {
    const docs = this.getDocuments();
    const newDoc: Document = { ...doc, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), downloadCount: 0 };
    this.setStorageItem('documents', [newDoc, ...docs]);
    this.updateUserPoints(doc.authorId, 10);
    this.trackActivity(doc.authorId);
    this.addNotification(doc.authorId, 'system', 'Документ загружен!', `«${newDoc.title}» загружен. +10 очков!`);
    return newDoc;
  }

  downloadDocument(docId: string, userId: string): { success: boolean; error?: string; dataUrl?: string; remaining?: number | string } {
    const user = this.getUsers().find(u => u.uid === userId);
    if (!user) return { success: false, error: 'Пользователь не найден' };
    const doc = this.getDocuments().find(d => d.id === docId);
    if (!doc) return { success: false, error: 'Документ не найден' };
    if (doc.isPremiumOnly && !user.isPremium) return { success: false, error: 'Только для Premium' };

    // Check download limit
    const today = new Date().toISOString().split('T')[0];
    if (!user.isPremium) {
      if (user.lastDownloadDate !== today) {
        user.dailyDownloads = 0;
        user.lastDownloadDate = today;
      }
      if (user.dailyDownloads >= FREE_DAILY_DOWNLOADS) {
        return { success: false, error: `Лимит ${FREE_DAILY_DOWNLOADS} скачиваний/день. Нужен Premium!` };
      }
      user.dailyDownloads += 1;
      user.lastDownloadDate = today;
    }

    // Update user
    const users = this.getUsers();
    const ui = users.findIndex(u => u.uid === userId);
    if (ui !== -1) { users[ui] = user; this.setStorageItem('users', users); }
    const cu = this.getCurrentUser();
    if (cu && cu.uid === userId) this.setStorageItem('currentUser', user);

    // Update download count
    const docs = this.getDocuments();
    const di = docs.findIndex(d => d.id === docId);
    if (di !== -1) { docs[di].downloadCount += 1; this.setStorageItem('documents', docs); }

    if (doc.authorId !== userId) {
      this.addNotification(doc.authorId, 'download', 'Скачивание!', `${user.displayName} скачал «${doc.title}»`);
    }

    return { success: true, dataUrl: doc.dataUrl, remaining: user.isPremium ? 'unlimited' : FREE_DAILY_DOWNLOADS - user.dailyDownloads };
  }

  // ========== NOTIFICATIONS ==========
  getNotifications(userId: string): Notification[] {
    return this.getStorageItem<Notification[]>('notifications', []).filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadCount(userId: string): number {
    return this.getStorageItem<Notification[]>('notifications', []).filter(n => n.userId === userId && !n.isRead).length;
  }

  addNotification(userId: string, type: Notification['type'], title: string, message: string, link?: string): void {
    const all = this.getStorageItem<Notification[]>('notifications', []);
    all.push({ id: Math.random().toString(36).substr(2, 9), userId, type, title, message, link, isRead: false, createdAt: new Date().toISOString() });
    this.setStorageItem('notifications', all);
  }

  markRead(notifId: string): void {
    const all = this.getStorageItem<Notification[]>('notifications', []);
    const idx = all.findIndex(n => n.id === notifId);
    if (idx !== -1) { all[idx].isRead = true; this.setStorageItem('notifications', all); }
  }

  markAllRead(userId: string): void {
    const all = this.getStorageItem<Notification[]>('notifications', []);
    all.forEach(n => { if (n.userId === userId) n.isRead = true; });
    this.setStorageItem('notifications', all);
  }

  // ========== PREMIUM ==========
  activatePremium(userId: string, plan: 'monthly' | 'yearly'): { success: boolean; premiumUntil: string } {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === userId);
    if (idx === -1) return { success: false, premiumUntil: '' };
    const days = plan === 'monthly' ? 30 : 365;
    const until = new Date(Date.now() + days * 86400000).toISOString();
    users[idx].isPremium = true;
    users[idx].premiumUntil = until;
    this.setStorageItem('users', users);
    const cu = this.getCurrentUser();
    if (cu && cu.uid === userId) this.setStorageItem('currentUser', users[idx]);
    this.addNotification(userId, 'premium', 'Premium активирован!', `Ваш Premium действует до ${new Date(until).toLocaleDateString('ru-RU')}.`);
    return { success: true, premiumUntil: until };
  }

  // ========== LEADERBOARD ==========
  getLeaderboard(limit = 20): LeaderboardEntry[] {
    const users = this.getUsers().sort((a, b) => b.points - a.points).slice(0, limit);
    const allComments = this.getStorageItem<Comment[]>('comments', []);
    const posts = this.getPosts();
    return users.map((u, i) => ({
      uid: u.uid, displayName: u.displayName, points: u.points, rank: i + 1,
      postsCount: posts.filter(p => p.authorId === u.uid).length,
      commentsCount: allComments.filter(c => c.authorId === u.uid).length,
      isPremium: u.isPremium
    }));
  }

  getStats() {
    return {
      usersCount: this.getUsers().length,
      postsCount: this.getPosts().length,
      commentsCount: this.getStorageItem<Comment[]>('comments', []).length,
      documentsCount: this.getDocuments().length
    };
  }
}

export const localDb = new LocalDatabase();

