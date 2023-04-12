/**
 * Created by clakeboy on 2017/12/3.
 */
import React from 'react';
import {GetComponent,GetQuery} from "../common/Funcs";
import Loader from './Loader';
import '../assets/css/main.less';
import Header from "./Header";
import LeftMenu from "./LeftMenu";
import Login from "./Login";
import Storage from "../common/Storage";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // login:true,
            login:false,
            title:'',
            isWxManage:false,
            mpInfo:null,
        };
        this.user = {
            Account:'Clake',
            user_name:'管理员'
        };
    }

    componentDidMount() {

    }
    setLogin = (user,is_login) => {
        this.user = user;
        this.setState({
            login:is_login
        });
    };
    setTitle = (title)=>{
        this.setState({
            title:title
        });
        document.title = title + ' - 系统监控';
    };

    render() {
        if (!this.state.login) {
            return <Login setLogin={this.setLogin}/>
        }

        return (
            <div className='d-flex flex-column h-100'>
                <Header setLogin={this.setLogin} title={this.state.title} user={this.user}/>
                <div className='d-flex flex-grow-1' style={{height:'calc(100% - 60px)'}}>
                    <div className='ck-left d-none d-sm-block'>
                        <LeftMenu user={this.user} />
                    </div>
                    <div className='flex-grow-1 main-content p-2'>
                        <Loader loadPath={this.props.location.pathname} query={GetQuery(this.props.location.search)} import={GetComponent} setTitle={this.setTitle} user={this.user} {...this.props}/>
                    </div>
                </div>
            </div>
        )
        // let test = [...Array(100).keys()];
    }
}