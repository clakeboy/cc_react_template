/**
 * Created by clakeboy on 2018/6/28.
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import '../assets/css/Left.less';
import TreeMenu from "./TreeMenu";
import Fetch from "../common/Fetch";
import {
    Modal,
    RImage
} from '@clake/react-bootstrap4';

class LeftMenu extends React.Component {
    wxMenu=[
        // {
        //     menu_name:'',
        //     menu_text:'系统',
        //     step:'1'
        // },
        // {
        //     menu_name:'system',
        //     menu_text:'系统管理',
        //     menu_icon:'cogs',
        //     sub_menus:[
        //         {
        //             menu_name:'user_manage',
        //             menu_text:'后台用户管理',
        //             menu_icon:'home',
        //             menu_link:'/system/account'
        //         },
        //         {
        //             menu_name:'menu_manage',
        //             menu_text:'后台菜单管理',
        //             menu_icon:'home',
        //             menu_link:'/system/menu'
        //         },
        //         {
        //             menu_name:'role_manage',
        //             menu_text:'角色管理',
        //             menu_icon:'home',
        //             menu_link:'/system/role'
        //         },
        //         {
        //             menu_name:'func_manage',
        //             menu_text:'功能模块管理',
        //             menu_icon:'home',
        //             menu_link:'/system/func'
        //         },
        //         {
        //             menu_name:'rule_manage',
        //             menu_text:'权限管理',
        //             menu_icon:'home',
        //             menu_link:'/system/rule_manage'
        //         }
        //     ]
        // },
        {
            menu_name:'',
            menu_text:'系统',
            step:'1'
        },
        {
            menu_name:'user_manage',
            menu_text:'后台用户管理',
            menu_icon:'user',
            menu_link:'/account/list'
        },
        {
            menu_name:'',
            menu_text:'管理功能',
            step:'1'
        },
        {
            menu_name:'home',
            menu_text:'首页',
            menu_icon:'home',
            menu_link:'/main'
        },
        {
            menu_name:'server_node',
            menu_text:'服务节点管理',
            menu_icon:'server',
            menu_link:'/server_node/list'
        },
        {
            menu_name:'service',
            menu_text:'功能管理',
            menu_icon:'coins',
            menu_link:'/service/list'
        },
        {
            menu_name:'shell',
            menu_text:'命令记录',
            menu_icon:'terminal',
            menu_link:'/shell/list'
        },
    ];
    constructor(props) {
        super(props);
        this.state={
            menu : this.wxMenu,
            init_menu: false,
            isWx: this.props.iswx
        };
    }

    componentWillReceiveProps(nextProp) {
        // if (this.state.isWx !== nextProp.iswx) {
        //     this.setState({
        //         isWx:nextProp.iswx
        //     },()=>{
        //         if (this.state.isWx) {
        //             this.loadUserMenu();
        //         }
        //     })
        // }
    }

    loadUserMenu() {
        Fetch('/serv/admin_auth/usr_auth_menu',{id:this.props.user.id},(res)=>{
            if (res.status) {
                this.setState({
                    init_menu:true,
                    menu:res.data
                });
            } else{
                this.modal.alert('获取权限数据出错!!!');
            }
        },(e)=>{
            this.modal.alert('远程调用出错!');
        });
    }

    menuClickHandler = (item)=>{
        let path = {
            pathname:item.menu_link
        };
        this.context.router.history.replace(path);
    };

    componentWillMount() {

    }

    componentDidMount() {
        // this.loadUserMenu()
    }

    getClasses() {
        let base = 'ck-left-main';

        return classNames(base,this.props.className);
    }

    render() {
        return (
            <div className={this.getClasses()}>
                {this.state.isWx && <div className='pt-3'>
                    <div className='d-flex justify-content-center'>
                        <RImage src={this.props.mp?.head_img} border/>
                    </div>
                    <div className="text-center">
                        {this.props.mp.name}
                    </div>
                </div>}
                <TreeMenu data={this.state.isWx?this.wxMenu:this.state.menu} onClick={this.menuClickHandler}/>
                <Modal ref={c => this.modal = c}/>
            </div>
        );
    }
}

LeftMenu.propTypes = {

};

LeftMenu.defaultProps = {

};

LeftMenu.contextTypes = {
    router: PropTypes.object
};

export default LeftMenu;