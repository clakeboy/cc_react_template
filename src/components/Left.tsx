import { Icon } from "@clake/react-bootstrap4";
import { AnyProps, CommonProps } from "../common/Common";
import TreeMenu,{Menu} from "./TreeMenu";
import {
    useNavigate
} from 'react-router-dom'
import {t} from 'i18next'
import '../assets/css/Left.less';
import { useEffect, useState } from "react";

export default function Left(props:AnyProps) {
    const navi = useNavigate()
    const [menu,setMenu] = useState<Menu[]>([])
    useEffect(()=>{
        const menuList:Menu[]=[
            {
                name:'',
                text:t('menu.system'),
                step:true
            },
            {
                name:'user_manage',
                text:t('menu.user'),
                icon:'user',
                link:'/account/list'
            },
            {
                name:'',
                text:t('menu.bus'),
                step:true
            },
            {
                name:'dashboard',
                text:t('menu.dashboard'),
                icon:'th-large',
                link:'/account/list'
            },
            {
                name:'shipment',
                text:t('menu.shipment'),
                icon:'ship',
                link:'/account/list',
                children:[
                    {
                        text:t('menu.mainlist'),
                        link:'/shipment/main',
                    },
                    {
                        text:t('menu.milestone'),
                        link:'/shipment/milestone',
                    },
                    {
                        text:t('menu.portsummary'),
                        link:'/shipment/port',
                    }
                ]
            },
            {
                name:'rate',
                text:t('menu.rate'),
                icon:'hand-holding-usd',
                link:'/account/list'
            },
            {
                name:'book',
                text:t('menu.book'),
                icon:'laptop',
                link:'/account/list'
            },
            {
                name:'invoice',
                text:t('menu.invoice'),
                icon:'file-invoice',
                link:'/account/list'
            },
            {
                name:'edoc',
                text:t('menu.edoc'),
                icon:'paste',
                link:'/account/list'
            },
            {
                name:'analysis',
                text:t('menu.analysis'),
                icon:'chart-bar',
                link:'/account/list'
            },
        ]
        setMenu(menuList)
    },[])

    function clickHandler(item:Menu) {
        navi(item.link??'',{replace:true})
    };

    return (
        <div className="ck-left-main">
            <TreeMenu data={menu} onClick={clickHandler}/>
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