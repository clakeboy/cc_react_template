import { Icon } from "@clake/react-bootstrap4";
import { AnyProps, CommonProps, Response } from "../common/Common";
import TreeMenu from "./TreeMenu";
import {
    useNavigate
} from 'react-router-dom'
import '../assets/css/Left.less';
import { useEffect, useState } from "react";
import Fetch from "../common/Fetch";
const menu=[
    {
        name:'',
        text:'系统',
        step:'1'
    },
    {
        name:'user_manage',
        text:'后台用户管理',
        icon:'user',
        link:'/account/list'
    },
    {
        name:'group_manage',
        text:'用户组管理',
        icon:'users',
        link:'/group/list'
    },
    {
        name:'menu_manage',
        text:'系统菜单管理',
        icon:'stream',
        link:'/menu/list'
    },
    {
        name:'bolt_db',
        text:'数据管理',
        icon:'database',
        link:'/boltdb/list'
    },
    {
        name:'',
        text:'管理功能',
        step:'1'
    },
    {
        name:'home',
        text:'首页',
        icon:'home',
        link:'/main'
    },
];

export default function Left(props:AnyProps) {
    const [menuData,setMenuData] = useState<any[]>([])
    const navi = useNavigate()

    useEffect(()=>{
        Fetch("/serv/login/auth_menu",{},(resp:Response)=>{
            if (resp.status) {
                setMenuData(resp.data)
            } else {
                setMenuData(menu)
            }
        })
    },[])

    function clickHandler(item:any) {
        navi(item.link,{replace:true})
    };

    return (
        <div className="ck-left-main">
            <TreeMenu data={menuData} onClick={clickHandler}/>
            <div className="small-btn px-1" onClick={()=>{
                const leftMain = document.querySelector('.ck-left') as HTMLElement
                const arrow = document.querySelector('.arrow') as HTMLElement
                if (arrow.classList.contains('arrow-180')) {
                    leftMain.classList.remove('left-small')
                    arrow.classList.remove('arrow-180')
                } else {
                    arrow.classList.add('arrow-180')
                    leftMain.classList.add('left-small')
                }
            }}>
                <div className="arrow">
                    <Icon icon="thumbtack"/>
                </div>
            </div>
        </div>
    )
}