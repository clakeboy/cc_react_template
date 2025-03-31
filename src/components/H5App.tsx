import { useLocation } from 'react-router-dom';
import Loader from './Loader';
import { GetQuery, GetApp } from '../common/Funcs';
import {useEffect, useRef, useState} from 'react';
import '../assets/css/h5.less';
import Fetch from "../common/Fetch";
import storage from "../common/Storage";

export default function App() {
    const [title, setTitle] = useState('');
    const [user, setUser] = useState(undefined);
    const [login, setLogin] = useState(false);
    const location = useLocation();
    let userSto = storage.get("pis-user")
    useEffect(() => {
        
    }, []);
    
    //parseUrlParams 解析url
    function parseUrlParams(url:string) {
        // 解析参数的正则表达式
        var reg = /(\w+)=([^&]+)/g;
        var params:any = {};
        var match;
        while (match = reg.exec(url)) {
            var key = match[1];
            var value = decodeURIComponent(match[2]);
            if (params[key]) {
                params[key].push(value);
            } else {
                params[key] = [value];
            }
        }
        return params;
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
        document.title = title;
    }

    return (
        <Loader
            loadPath={location.pathname}
            query={GetQuery(location.search)}
            import={GetApp}
            user={user}
            setTitle={changeTitle}
        />
    );
}
