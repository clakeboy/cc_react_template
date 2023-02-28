/**
 * Created by clakeboy on 2020/2/5.
 */
import React from 'react';
import {
    Button,
    Input,
    Card,
    Switch,
    Form,
    CKModal, Modal,
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";

let emptyData = {
    id:0,
    account:'',
    password:'',
    name:'',
    phone:'',
    created_date:0,
};

class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: Object.assign({},emptyData),
            is_save:false,
            edit:false,
        };

        this.is_change = false;
        this.edit_id = this.props.id || null;
    }

    componentDidMount() {
        if (this.edit_id) {
            this.loadData(this.edit_id);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.edit_id) {
            this.edit_id = nextProps.id || null;
            if (this.edit_id) {
                this.loadData(nextProps.id);
            } else {
                this.setState({
                    data: Object.assign({},emptyData),
                    edit:false,
                })
            }
        }
    }

    loadData(id) {
        this.modal.loading('加载数据中...');
        Fetch('/serv/manager/find',{id:id},(res)=>{
            if (res.status) {
                this.modal.close();
                this.setState({
                    data:res.data,
                    edit:true,
                })
            } else {
                this.modal.alert('加载数据出错!'+res.msg)
            }
        },(e)=>{
            this.modal.alert('网络加载出错!'+JSON.stringify(e));
        });
    }

    changeHandler = (field,val)=>{
        let data = this.state.data;
        data[field] = val;
        this.setState({
            data:data
        });
    };

    saveHandler = ()=>{
        let data = Object.assign({},this.state.data);
        this.modal.loading('保存数据中...');
        this.setState({
            is_save:true
        });
        Fetch('/serv/manager/save',{data:data},(res)=>{
            if (res.status) {
                this.modal.alert({
                    content:'保存数据成功!',
                    callback:()=>{
                        this.props.callback(true);
                    }
                });
            } else {
                this.modal.alert('保存数据出错! '+res.msg);
            }
        },(e)=>{
            this.setState({
                is_save:false
            });
            this.modal.alert('网络出错!'+JSON.stringify(e));
        });
    };

    render() {
        return (
            <div>
                <Form onChange={this.changeHandler}>
                    <Input label='帐号登录名' disabled={this.edit_id!==null} placeholder='登录管理后台帐号名' field='account' data={this.state.data.account}/>
                    <Input label='密码' placeholder='不填写密码为不修改' field='password' type='password' data={this.state.data.password}/>
                    <Input label='真实姓名' field='name' data={this.state.data.name}/>
                    <Input label='手机号' field='phone' data={this.state.data.phone}/>
                    {this.state.edit?<Input label='创建时间' disabled field='created_date' data={moment.unix(this.state.data.created_date).format("YYYY-MM-DD hh:mm:ss")}/>:null}
                </Form>
                <div>
                    <Button className='float-right' icon='save' onClick={this.saveHandler}>保存</Button>
                </div>
                <Modal ref={c => this.modal = c}/>
            </div>
        );
    }
}


export default Edit;