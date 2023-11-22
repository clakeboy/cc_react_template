import { useLocation } from 'react-router-dom';

import Header from './Header';
import Loader from './Loader';
import { GetQuery, GetModules, GetLang } from '../common/Funcs';
import { useEffect, useState } from 'react';
import Login from './Login';
import '../assets/css/main.less';
import '../assets/css/theme-dark.less'
import { t, changeLanguage } from 'i18next';
import Left from './Left';
import Fetch from '../common/Fetch';
import Storage from '../common/Storage';

function changeDark(flag: boolean) {
    const main = document.querySelector('#react-main');
    const html = document.querySelector('html')
    if (flag) {
        if (!main?.classList.contains('theme-dark')) {
            main?.classList.add('theme-dark');
        }
        if (html) 
            html.dataset.bsTheme = 'dark';
    } else {
        main?.classList.remove('theme-dark');
        if (html)
            html.dataset.bsTheme = 'light';
    }
    Storage.set("theme-dark",flag)
}

export default function App() {
    const [login, setLogin] = useState(false);
    const [lang, setLang] = useState(GetLang());
    const [user, setUser] = useState(undefined);
    const [title, setTitle] = useState('');
    const location = useLocation();
    
    useEffect(() => {
        // console.log('location change', location);
        let flag = Storage.get("theme-dark")
        if (flag) {
            changeDark(JSON.parse(flag))
        }
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
        document.title = 'BTM - '+title;
    }

    let darkStore = Storage.get("theme-dark")
    const darkFlag = darkStore?JSON.parse(darkStore):false;

    if (!login) {
        return (
            <Login
                changeDark={changeDark}
                lang={lang}
                query={GetQuery(location.search)}
                changeLang={changeLang}
                setLogin={changeLogin}
            />
        );
    }
    return (
        <div className="d-flex flex-column h-100">
            <Header
                title={title}
                lang={lang}
                user={user}
                dark={darkFlag}
                setTitle={changeTitle}
                setLang={changeLang}
                setLogin={changeLogin}
                setDark={changeDark}
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
                        setDark={changeDark}
                    />
                </div>
            </div>
        </div>
    );
}
