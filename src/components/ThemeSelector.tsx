import { useState, useRef, useEffect } from 'react';
import { Icon } from '@clake/react-bootstrap4';
import { ThemeType, themes, getThemeList, setTheme, getCurrentTheme } from '../common/Theme';
import '../assets/css/theme-selector.less';

interface ThemeSelectorProps {
  setTheme?: (theme: ThemeType) => void;
}

// 获取按钮样式配置
const getButtonStyleConfig = (theme: ThemeType) => {
  const themeConfig = themes[theme];
  
  switch (theme) {
    case 'light':
      // 明亮主题使用白底黑灰色字
      return {
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textColor: '#495057',
        iconColor: '#ffc107',
      };
    case 'dark':
      // 暗黑主题使用深灰底白字
      return {
        backgroundColor: '#343a40',
        border: '1px solid #495057',
        boxShadow: 'none',
        textColor: '#ffffff',
        iconColor: '#ffffff',
      };
    case 'purple':
    case 'blue':
    case 'green':
    case 'orange':
      // 彩色主题使用白色背景按钮，增强对比度
      return {
        backgroundColor: '#ffffff',
        border: `2px solid ${themeConfig.color}`,
        boxShadow: `0 2px 8px ${themeConfig.color}40`,
        textColor: themeConfig.color,
        iconColor: themeConfig.color,
      };
    default:
      return {
        backgroundColor: themeConfig.color + '20',
        border: `1px solid ${themeConfig.color}40`,
        boxShadow: 'none',
        textColor: themeConfig.color,
        iconColor: themeConfig.color,
      };
  }
};

export default function ThemeSelector(props: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getCurrentTheme());
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭面板
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPanel(false);
      }
    }

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
    setCurrentTheme(theme);
    if (props.setTheme) {
      props.setTheme(theme);
    }
    setShowPanel(false);
  };

  const currentConfig = themes[currentTheme];
  const buttonStyleConfig = getButtonStyleConfig(currentTheme);

  return (
    <div style={{ position: 'relative' }}>
      {/* 主题选择按钮 */}
      <div
        ref={buttonRef}
        className="theme-selector-btn"
        onClick={() => setShowPanel(!showPanel)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          backgroundColor: buttonStyleConfig.backgroundColor,
          border: buttonStyleConfig.border,
          boxShadow: buttonStyleConfig.boxShadow,
        }}
      >
        <Icon
          icon={currentConfig.icon}
          style={{
            color: buttonStyleConfig.iconColor,
            fontSize: '1rem'
          }}
        />
        <span
          className="d-none d-md-inline"
          style={{
            fontSize: '0.875rem',
            color: buttonStyleConfig.textColor,
            fontWeight: 600
          }}
        >
          {currentConfig.name}
        </span>
        <Icon
          icon="caret-down"
          style={{
            fontSize: '0.75rem',
            color: buttonStyleConfig.textColor,
            marginLeft: '4px',
            transform: showPanel ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* 下拉面板 */}
      {showPanel && (
        <div
          ref={panelRef}
          className="theme-panel-content"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '8px',
            zIndex: 9999,
            border: `2px solid ${currentConfig.color}`
          }}
        >
          <div
            className="theme-panel-header"
            style={{
              padding: '8px 12px',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: currentConfig.color,
              borderBottom: `2px solid ${currentConfig.color}30`,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon icon="palette" style={{ marginRight: '8px', color: currentConfig.color }} />
            选择主题
          </div>
          <div className="theme-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {getThemeList().map(({ key, config }) => (
              <div
                key={key}
                className={`theme-item ${currentTheme === key ? 'active' : ''}`}
                onClick={() => handleThemeChange(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: currentTheme === key ? config.color + '15' : 'transparent',
                  transition: 'all 0.15s ease',
                  border: currentTheme === key ? `2px solid ${config.color}` : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (currentTheme !== key) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="theme-icon-wrapper"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: config.color + '20',
                    border: currentTheme === key ? `2px solid ${config.color}` : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon
                    icon={config.icon}
                    style={{ color: config.color, fontSize: '0.875rem' }}
                  />
                </div>
                <div className="theme-info" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span
                    className="theme-name"
                    style={{
                      fontSize: '0.875rem',
                      color: currentTheme === key ? config.color : '#333',
                      fontWeight: currentTheme === key ? 600 : 500
                    }}
                  >
                    {config.name}
                  </span>
                  <div
                    className="theme-color-dot"
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
                {currentTheme === key && (
                  <div className="theme-check">
                    <Icon icon="check" style={{ color: config.color, fontSize: '0.75rem' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
