import Storage from './Storage';

export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

export interface ThemeConfig {
  name: string;
  icon: string;
  color: string;
  className: string;
  bsTheme: 'light' | 'dark';
}

export const themes: Record<ThemeType, ThemeConfig> = {
  light: {
    name: '明亮',
    icon: 'sun',
    color: '#ffc107',
    className: 'theme-light',
    bsTheme: 'light',
  },
  dark: {
    name: '暗黑',
    icon: 'moon',
    color: '#6c757d',
    className: 'theme-dark',
    bsTheme: 'dark',
  },
  blue: {
    name: '海洋蓝',
    icon: 'water',
    color: '#0d6efd',
    className: 'theme-blue',
    bsTheme: 'light',
  },
  green: {
    name: '森林绿',
    icon: 'leaf',
    color: '#198754',
    className: 'theme-green',
    bsTheme: 'light',
  },
  purple: {
    name: '优雅紫',
    icon: 'gem',
    color: '#6f42c1',
    className: 'theme-purple',
    bsTheme: 'dark',
  },
  orange: {
    name: '活力橙',
    icon: 'fire',
    color: '#fd7e14',
    className: 'theme-orange',
    bsTheme: 'light',
  },
};

const STORAGE_KEY = 'app-theme';

export function getCurrentTheme(): ThemeType {
  const stored = Storage.get(STORAGE_KEY);
  if (stored && themes[stored as ThemeType]) {
    return stored as ThemeType;
  }
  // 兼容旧版本
  const oldDark = Storage.get('theme-dark');
  if (oldDark) {
    const isDark = JSON.parse(oldDark);
    return isDark ? 'dark' : 'light';
  }
  return 'light';
}

export function setTheme(theme: ThemeType): void {
  const body = document.body;
  const html = document.querySelector('html');
  
  // 移除所有主题类
  Object.values(themes).forEach(t => {
    body?.classList.remove(t.className);
  });
  
  // 添加新主题类
  const config = themes[theme];
  if (config) {
    body?.classList.add(config.className);
    if (html) {
      html.dataset.bsTheme = config.bsTheme;
    }
  }
  
  Storage.set(STORAGE_KEY, theme);
}

export function initTheme(): void {
  const theme = getCurrentTheme();
  setTheme(theme);
}

export function getThemeList(): { key: ThemeType; config: ThemeConfig }[] {
  return Object.entries(themes).map(([key, config]) => ({
    key: key as ThemeType,
    config,
  }));
}
