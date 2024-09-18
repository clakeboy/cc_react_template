import {
    Button,
    CKModal,
    Card,
    Container,
    Form,
    Input,
    Modal,
    Pagination,
    Table,
    TableHeader,
    Theme,
} from '@clake/react-bootstrap4';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Fetch from '../../common/Fetch';
import { Condtion, Response } from '../../common/Common';
import Loader from '../../components/Loader';
import { GetModules } from '../../common/Funcs';

interface conditions {
    name?: string;
}

function buildCondition(cond: conditions): Condtion[] {
    const list: Condtion[] = [];
    if (cond.name) {
        list.push({
            name: 'Name',
            type: 'eq',
            value: cond.name,
        });
    }
    return list;
}

export default function List(props: any): any {
    const [list, setList] = useState([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false)
    const [conditions, setConditions] = useState<conditions>({});
    let modal = useRef<CKModal>(null);
    useEffect(() => {
        getUserData(1);
        props.setTitle && props.setTitle('后台用户管理')
    }, []);

    function getUserData(page: number) {
        setLoading(true)
        Fetch('/serv/acc/query', { page: page, number: 30, query: buildCondition(conditions) }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setList(res.data.list);
                setCount(res.data.count);
                setPage(page);
            } else {
                modal.current?.alert('用户数据获取出错：' + res.msg);
            }
        });
    }

    return (
        <Card>
            <div className="mb-2">
                <Button
                    icon="search"
                    className="me-1"
                    onClick={() => {
                        getUserData(1);
                    }}>
                    查询
                </Button>
                <Button icon="trash-alt" outline theme={Theme.danger}>
                    清除
                </Button>
                <Button className='float-end' theme={Theme.success} onClick={()=>{
                    modal.current?.view({
                        title:"添加用户",
                        header:true,
                        content: <Loader loadPath="/account/Edit" import={GetModules}/>,
                        width:'400px',
                    })
                }}>添加用户</Button>
            </div>
            <hr />
            <div className="comm-form">
                <Form onChange={(field,val)=>{
                    setConditions({...conditions,[field]:val})
                }}>
                    <Input field='name' placeholder="用户名查找" data={conditions.name ?? ''} />
                </Form>
            </div>
            
            <div>
                <Table loading={loading} hover select={false} emptyText="没有数据" data={list}>
                    <TableHeader field="id" text="用户 Id" />
                    <TableHeader field="name" text="用户名" />
                    <TableHeader field="passwd" text="密码" onFormat={()=>{
                        return <div className='badge bg-secondary'>加密</div>
                    }}/>
                    <TableHeader
                        field="created_date"
                        text="创建时间"
                        onFormat={(val) => {
                            if (!val) return '';
                            return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        }}
                    />
                    <Table.Header
                        field="modified_date"
                        text="修改时间"
                        onFormat={(val) => {
                            if (!val) return '';
                            return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        }}
                    />
                    <TableHeader field="modified_date" text="操作" align='center' onFormat={(val,row)=>{
                        return <>
                        <Button onClick={()=>{
                            modal.current?.view({
                                title:"修改用户数据",
                                header:true,
                                content: <Loader loadPath="/account/Edit" id={row.id} import={GetModules}/>,
                                width:'400px',
                            })
                        }} size='sm' theme={Theme.success}>修改</Button>
                        </>
                    }}/>
                </Table>
                <Pagination
                    count={count}
                    current={page}
                    number={30}
                    showPages={10}
                    onSelect={(page, showNumber) => {
                        getUserData(page);
                    }}
                />
            </div>
            <Modal ref={modal} />
        </Card>
    );
}
