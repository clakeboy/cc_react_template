/**
 * Created by clakeboy on 2018/6/28.
 */
import React from 'react';
import classNames from 'classnames/bind';
import '../assets/css/header.less';
import {Icon, RImage} from '@clake/react-bootstrap4';
import Fetch from "../common/Fetch";
import PropTypes from "prop-types";
import Storage from "../common/Storage";

class Header extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title:this.props.title,
            back:false,
            isWx:false,
        }
    }
    componentDidMount() {

    }

    componentWillReceiveProps(nextProp) {
        if (this.state.title !== nextProp.title) {
            let is_back = false;
            if (this.context.router.history.action === 'PUSH') {
                is_back = true;
            }
            this.setState({
                title: nextProp.title,
                back:is_back
            });
        }
    }

    logout = () => {
        Fetch('/serv/login/logout',{},(res)=>{
            if (res.status) {
                this.props.setLogin(null,false);
            }
        })
    };

    getClasses() {
        let base = 'd-flex align-items-center main-header';

        return classNames(base,this.props.className);
    }
    setIsWx=()=>{
        this.props.setWxMenu(null,false);
    };
    render() {
        return (
            <div className={this.getClasses()}>
                <div className='ck-header-left d-none d-sm-block'>
                    <div className='page-title text-info'>
                        <Icon className='icon' iconType='brands' icon='sellsy'/>
                        {'\u0020'}系统监控
                    </div>
                </div>
                <div className='ck-header-right'>
                    {this.state.back?<div onClick={()=>{
                        this.context.router.history.goBack();
                    }} className='page-title back'>
                        <Icon icon='angle-left'/>
                        </div>:null}
                    <div className='page-title'>
                        {this.state.title}
                    </div>
                    <div className='float-right'>
                        <ul className="nav navbar-nav user-nav">
                            <li className="nav-item dropdown">
                                <a href="#" data-toggle="dropdown" role="button" aria-expanded="false" className="nav-link dropdown-toggle">
                                    <RImage width='32px' height='32px' circle border src={this.props.user.acc_head_img||"http://img.tubaozhang.com/static/images/head/head_64_11.png"}/>
                                    {/*<img src={this.props.user.acc_head_img||"http://img.tubaozhang.com/static/images/head/head_64_11.png"} alt="Avatar"/>*/}
                                    <span className="user-name">{this.props.user.name}</span>
                                </a>
                                <div role="menu" className="dropdown-menu">
                                    <div className="user-info">
                                        <div className="user-name">{this.props.user.account}</div>
                                        <div className="user-level">{this.props.user.name}</div>
                                    </div>
                                    {this.state.isWx?<a href="#" className="dropdown-item" onClick={this.setIsWx}><Icon icon='user'/> 切换公众号</a>:null}
                                    <a href="#" className="dropdown-item" onClick={this.logout}><Icon icon='power-off'/> 退出登录</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {

};

Header.defaultProps = {

};

Header.contextTypes = {
    router: PropTypes.object
};
export default Header;