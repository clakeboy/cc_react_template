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
    function wxLogin(){
        //判断url是否有token
        let urlArr =parseUrlParams(location.search)
        let wxOpen = ""
        if(urlArr['wx'] !==undefined && urlArr['wx'] !==null && urlArr["wx"] !==''){
            wxOpen=urlArr['wx']
        }else{
            let urlArr =parseUrlParams(document.URL)
            if(urlArr["wx"] !==undefined && urlArr["wx"] !==null && document.URL.indexOf("wx=") > -1){
                wxOpen = document.URL.split("wx=")[1]
                wxOpen = wxOpen.split('#')[0]
            }
        }
        if(wxOpen !==''){
            //开始请求
            Fetch("/serv/currency/query_wx_user",{wx:wxOpen},function (res:any){
                if(res.status && res.data !==null){
                    storage.set("pis-user",JSON.stringify(res.data))
                    setLogin(true)
                    setUser({...res.data})
                }else{
                }
            })
        }else{
            let backUrl = document.location.href
            //跳转地址并获取参数
            window.location.href="https://pf.tubaozhang.com/ota/user/auth/wxd0cd00c714a287d3?u="+encodeURIComponent(backUrl)+"&c="+encodeURIComponent(backUrl)
        }
    }
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
    // if (!login) {
    //     return (
    //         <div className={"bg-white text-center mt-5"}>正在授权登录中，请稍等...</div>
    //     );
    // }
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
