import { Icon } from "@clake/react-bootstrap4";
import { AnyProps, CommonProps } from "../common/Common";
import TreeMenu from "./TreeMenu";
import {
    useNavigate
} from 'react-router-dom'
import '../assets/css/Left.less';
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
    {
        name:'bank',
        text:'银行管理',
        icon:'university',
        children:[
            {
                name:'sub_account',
                text:'子帐户',
                icon:'university',
                link:'/bank/list'
            },
            {
                name:'refund',
                text:'银行退款记录',
                icon:'university',
                link:'/refund/list'
            },
        ]
    }
];

export default function Left(props:AnyProps) {
    const navi = useNavigate()
    function clickHandler(item:any) {
        navi(item.link,{replace:true})
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