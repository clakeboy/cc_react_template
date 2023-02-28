/**
 * Created by clakeboy on 2018/6/29.
 */
import React from 'react';

import '../assets/css/Login.less';
import {LoadScript} from '../common/Common';

import {
    Icon,
    Input,
    Button,
    CCheckbox,
    CKModal,
    Load
} from '@clake/react-bootstrap4';
import Fetch from "../common/Fetch";
import Storage from "../common/Storage";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page_data:{
                user_name:'',
                password:'',
                remember:false
            },
            init:false,
            tab:true
        };

        let login_name = Storage.get('login_name');
        if (login_name) {
            this.state.page_data.user_name = login_name;
            this.state.page_data.remember = true;
        }

        this.scene = {};
        this.rule = null;
        this.user = null;
    }

    componentWillMount() {

    }

    componentDidMount() {
        document.title = '系统';
        window.PLogin = this;
        this.checkLogin()
    }

    componentDidUpdate(prevProps, prevState) {

    }


    checkLogin() {
        Fetch('/serv/login/auth',{},(res)=>{
            if (res.status) {
                this.setLogin(res.data);
            } else {
                this.setState({
                    init:true
                })
            }
        },(e)=>{

        })
    }

    setLogin(user) {
        this.user = user;
        this.props.setLogin(user,true);
    }

    /**
     * 加载权限验证规则
     */
    loadAuthRule = (user)=> {
        Fetch('/serv/login/get_auth_rule',{id:user.id},(res)=>{
            if (res.status) {
                this.rule = res.data;
                this.setLogin(user);
            }
        });
    };

    getUser() {
        return this.user;
    }

    getRule() {
        return this.rule;
    }

    changeHandler(name){
        return (val)=>{
            let data = this.state.page_data;
            data[name] = val;
            this.setState({
                page_data:data
            })
        };
    }

    login = () => {
        if (this.state.page_data.remember) {
            Storage.set('login_name',this.state.page_data.user_name);
        } else {
            Storage.remove('login_name');
        }
        this.modal.loading('正在登录中...');
        Fetch('/serv/login/login',{
            username:this.state.page_data.user_name,
            password:this.state.page_data.password,
            scene:this.scene
        },(res)=>{
            if (res.status) {
                this.modal.close();
                // this.loadAuthRule(res.data);
                this.setLogin(res.data);
            } else {
                if(res.msg==="not found"){
                    this.modal.alert("用户名或密码错误，登录失败");
                }else{
                    this.modal.alert(res.msg);
                }
            }
        },(e)=>{
            this.modal.alert('远程调用错误! '+e);
        })
    };

    render() {
        if (!this.state.init) {
            return this.renderLoad()
        }
        return this.renderLogin()
    }

    renderLoad() {
        return (
            <div className='text-center text-danger mt-5 mb-5'>
                <Load>加载中</Load>
            </div>
        )
    }

    renderLogin() {
        return (
            <div className='ck-login'>
                <div className="card ck-login-window">
                    <div className="card-header text-info text-center">
                        <Icon icon='sys' /> 系统监控管理
                    </div>
                    <div className="card-body">
                        <Input className='mb-3' size='lg' placeholder='用户名' data={this.state.page_data.user_name} onChange={this.changeHandler('user_name')}/>
                        <Input className='mb-3' onEnter={this.login} placeholder='密码' size='lg' type='password' data={this.state.page_data.password} onChange={this.changeHandler('password')}/>
                        <CCheckbox label='记住用户名' onChange={e=>{
                            let data = this.state.page_data;
                            data['remember'] = e.target.checked;
                            this.setState({
                                page_data:data
                            })
                        }} checked={this.state.page_data.remember}/>
                        <p style={{marginTop:'10px'}}>
                            <Button size='lg' block onClick={this.login} >确认登录</Button>
                        </p>
                    </div>
                </div>
                <CKModal ref={c=>this.modal=c}/>
            </div>
        );
    }
}

Login.propTypes = {

};

Login.defaultProps = {

};

export default Login;