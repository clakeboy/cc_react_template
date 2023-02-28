/**
 * Created by clakeboy on 2020/2/5.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
    Card,
    Container,
    Table,
    Pagination,
    Input,
    Button,
    Modal,
    ButtonGroup,
    LoaderComponent, Form
} from '@clake/react-bootstrap4';
import Fetch from "../../common/Fetch";
import {GetComponent} from "../../common/Funcs";

class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            conditions: {},
            data       : [],
            count  : 0,
            currentPage: 1
        };

        this.pageNum = 30;
        this.props.setTitle('后台用户管理');
    }

    componentDidMount() {
        this.loadData(1)
    }

    getCondition() {
        let conditions = [];
        if (this.state.conditions.account) {
            conditions.push({
                type:'eq',
                name:'Account',
                value:this.state.conditions.account
            })
        }

        return conditions;
    }

    changeHandler = (field,val)=>{
        let data = this.state.conditions;
        data[field] = val;
        this.setState({
            conditions:data
        });
    };

    loadData (page) {
        this.modal.loading('正在获取数据中...');
        Fetch('/serv/manager/query',{query:this.getCondition(),page:page,number:this.pageNum},(res)=>{
            if (res.status) {
                this.modal.close();
                this.setState({
                    data:res.data.list,
                    currentPage:page,
                    count:res.data.count
                });
            } else {
                this.modal.alert('没有任何数据!',()=>{
                    this.setState({
                        data:[],
                        currentPage:1,
                        count:0
                    });
                });
            }
        },(e)=>{
            this.modal.alert('获取数据出错');
        });
    }

    delUser(row){
        this.modal.confirm({
            title:'警告',
            content:'你是否要删除当前用户?',
            callback:()=>{
                Fetch('/serv/manager/delete',{id:row.id},(res)=>{
                    if (res.status) {
                        this.modal.alert({
                            title:'提示',
                            content:'删除成功!',
                            callback:()=>{
                                this.loadData(1)
                            }
                        });
                    } else {
                        this.modal.alert('无法删除当前用户!');
                    }
                });
            }
        });
    };

    addUser() {
        this.modal.view({
            title:'添加用户',
            width:'400px',
            content:<LoaderComponent import={GetComponent} callback={this.callback} loadPath='/account/Edit'/>,
        });
    }

    editUser(id) {
        this.modal.view({
            title:'修改用户',
            width:'400px',
            content:<LoaderComponent import={GetComponent} id={id} callback={this.callback} loadPath='/account/Edit'/>,
        });
    }

    callback = (is_refresh) =>{
        this.modal.close();
        if (is_refresh) {
            this.loadData(1);
        }
    };

    render() {
        return (
            <Card>
                <div>
                    <Button className='mr-1' onClick={()=>this.loadData(1)} icon="search">搜索</Button>
                    <Button className='float-right' theme='success' icon='plus' onClick={()=>{
                        this.addUser();
                    }}>新增</Button>
                </div>
                <hr/>
                <Container className='p-0 mb-1' inline fluid>
                    <Form onChange={this.changeHandler}>
                        <Input className='mr-1' width='160' field='account' placeholder='帐号名称查询' data={this.state.conditions.account}/>
                    </Form>
                </Container>
                <hr/>
                <Table headerTheme='light' data={this.state.data} select={false} emptyText='没有用户数据'>
                    <Table.Header text='ID' field='id'/>
                    <Table.Header text='登录名' field='account'/>
                    <Table.Header text='真实姓名' field='name'/>
                    <Table.Header text='电话' field='phone'/>
                    <Table.Header text='创建时间' field='created_date' onFormat={value => {
                        return moment.unix(value).format("YYYY-MM-DD HH:mm:ss");
                    }}/>
                    <Table.Header text='操作' align='center' onFormat={(value,row) => {
                        return <ButtonGroup>
                            <Button size='sm' icon='edit' theme='success' onClick={()=>{
                                this.editUser(row.id);
                            }}>修改</Button>
                            <Button size='sm' icon='trash-alt' theme='danger' onClick={()=>{this.delUser(row)}}> </Button>
                        </ButtonGroup>
                    }}/>
                </Table>
                <Pagination count={this.state.count} current={this.state.currentPage}
                            number={this.pageNum} showPage={10}
                            onSelect={page => this.loadData(page)}/>
                <Modal ref={c => this.modal = c}/>
            </Card>
        );
    }
}

export default List;