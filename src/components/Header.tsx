import {
    CKModal,
    DropPanel,
    Icon,
    Modal,
} from '@clake/react-bootstrap4'
import { useEffect, useRef, useState } from 'react';
import { CommonProps, UserData } from '../common/Common';
import '../assets/css/header.less';
import {
    useLocation,
    useNavigationType
} from 'react-router-dom'
import Loader from './Loader';
import { GetModules } from '../common/Funcs';
import { t } from 'i18next';

function getClasses(): string {
    let base = 'd-flex align-items-center main-header';
    return base;
}

interface HeaderProp extends CommonProps {
    title: string
    user?: any
}

export default function Header(props: HeaderProp) {
    const [back, setBack] = useState(false)
    const [avatar, setAvatar] = useState('')
    const naviType = useNavigationType()
    let location = useLocation();
    let modal = useRef<CKModal>(null);
    useEffect(() => {
        // @ts-ignore
        const avatar = multiavatar(props.user?.user_name)
        setAvatar(avatar)
    }, [location])
    return (
        <div className="d-flex align-items-center main-header">
            <div className='ck-header-left d-none d-sm-block'>
                <div className='page-title text-primary'>
                    <Icon className='me-2' icon='globe' />
                    {t('system_name')}
                </div>
            </div>
            <div className='d-block d-sm-none p-3'>
                <Icon className='icon' icon='bars' />
            </div>
            <div className='ck-header-right flex-grow-1'>
                {back ? <div onClick={() => {
                    props.router.History(-1)
                }} className='page-title back'>
                    <Icon icon='angle-left' />
                </div> : null}
                <div className='page-title'>
                    {props.title}
                </div>
                <div className='float-end px-3 user-info'>
                    <div className='h-100 d-flex align-items-center align-content-center' id='menu-avatar'>
                        <div className='avatar me-2' dangerouslySetInnerHTML={{__html:avatar}}/>
                        <div>{props.user?.user_name}</div>
                        <DropPanel className='bg-white' borderColor='#0d6efd' selector='#menu-avatar'>
                            <div className='panel'>
                                <div className='head p-3 text-center'>
                                    <div className='m-auto' style={{width:'100px'}} dangerouslySetInnerHTML={{__html:avatar}}></div>
                                    <div>{props.user?.user_name}</div>
                                    <div className='small'>{props.user?.login_name}</div>
                                </div>
                                <div className='py-2'>
                                    <div className='menu-item px-3 row' onClick={()=>{
                                         modal.current?.view({
                                            title:t('header.change'),
                                            header:true,
                                            content: <Loader loadPath="/user/Change" id={props.user?.id} import={GetModules}/>,
                                            width:'400px',
                                        })
                                    }}>
                                        <div className='col-3 text-center'><Icon icon='cogs'/></div>
                                        <div className='col'>{t('header.change')}</div>
                                    </div>
                                    <div className='menu-item px-3 row' onClick={()=>{
                                        props.setLogin(false,undefined)  
                                    }}>
                                        <div className='col-3 text-center'><Icon icon='power-off'/></div>
                                        <div className='col'>{t('header.logout')}</div>
                                    </div>
                                </div>
                            </div>
                        </DropPanel>
                    </div>
                </div>
            </div>
            <Modal ref={modal}/>
            {/* <Modal ref={c => this.modal = c}/> */}
        </div>
    );
}