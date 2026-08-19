import { useLocation } from 'react-router-dom';

import Header from './Header';
import Loader from './Loader';
import { GetQuery, GetModules, GetLang } from '../common/Funcs';
import { useEffect, useState } from 'react';
import Login from './Login';
import Setup from './Setup'
import '../assets/css/main.less';
import '../assets/css/theme-dark.less';
import '../assets/css/themes.less';
import { t, changeLanguage } from 'i18next';
import Left from './Left';
import Watermark from './Watermark';
import Fetch from '../common/Fetch';
import Storage from '../common/Storage';
import { initTheme, ThemeType, setTheme } from '../common/Theme';

export default function App() {
    const [login, setLogin] = useState(false);
    const [lang, setLang] = useState(GetLang());
    const [user, setUser] = useState(undefined);
    const [title, setTitle] = useState('');
    const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');
    const location = useLocation();
    
    useEffect(() => {
        // 初始化主题
        initTheme();
    }, []);

    function changeLang(lang: string) {
        changeLanguage(lang, () => {
            localStorage.setItem('lang', lang);
            setLang(lang);
        });
    }

    function changeLogin(flag: boolean, user: any) {
        if (!flag) {
            Fetch('/serv/login/logout',{},(res)=>{
                if (res.status) {
                    setLogin(false);
                    setUser(undefined);
                }
            })
        } else {
            setLogin(flag);
            setUser(user);
        }
    }

    function changeTitle(title: string) {
        setTitle(title);
        document.title = 'pcbx_chancel - '+title;
    }

    function handleThemeChange(theme: ThemeType) {
        setTheme(theme);
        setCurrentTheme(theme);
    }

    if (location.pathname === "/setup") {
        return <>
            <Watermark user={user} />
            <Setup />
        </>
    }

    if (!login) {
        return (
            <>
                <Watermark user={user} />
                <Login
                    theme={currentTheme}
                    setTheme={handleThemeChange}
                    lang={lang}
                    query={GetQuery(location.search)}
                    changeLang={changeLang}
                    setLogin={changeLogin}
                />
            </>
        );
    }
    return (
        <>
            <Watermark user={user} />
            <div className="d-flex flex-column h-100">
            <Header
                title={title}
                lang={lang}
                user={user}
                theme={currentTheme}
                setTitle={changeTitle}
                setLang={changeLang}
                setLogin={changeLogin}
                setTheme={handleThemeChange}
            />
            <div className="d-flex flex-grow-1" style={{ height: 'calc(100% - 60px)' }}>
                <div className="ck-left d-none d-sm-block">
                    <Left />
                </div>
                <div className="flex-grow-1 main-content p-2">
                    <Loader
                        loadPath={location.pathname}
                        query={GetQuery(location.search)}
                        import={GetModules}
                        setTitle={changeTitle}
                        setLang={changeLang}
                        setTheme={handleThemeChange}
                    />
                </div>
            </div>
            </div>
        </>
    );
}
