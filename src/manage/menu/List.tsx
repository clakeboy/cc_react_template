import {
    Button,
    CKModal,
    Card,
    Container,
    Form,
    Icon,
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
        getData(1);
        props.setTitle && props.setTitle('系统菜单管理')
    }, []);

    function getData(page: number) {
        setLoading(true)
        Fetch('/serv/menu/query', { page: page, number: 1000, query: buildCondition(conditions) }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setList(res.data);
            } else {
                modal.current?.alert('数据获取出错：' + res.msg);
            }
        });
    }

    function reIndex() {
        setLoading(true)
        Fetch('/serv/menu/reindex', { }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                getData(1);
            } else {
                modal.current?.alert('重建索引出错：' + res.msg);
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
                        getData(1);
                    }}>
                    查询
                </Button>
                <Button icon="trash-alt" outline theme={Theme.danger}>
                    清除
                </Button>
                <Button className='ms-1' onClick={()=>{
                    reIndex()
                }} icon='table' tip='重建索引' theme={Theme.dark}/>
                <Button className='float-end' theme={Theme.success} onClick={()=>{
                    modal.current?.view({
                        title:"添加菜单",
                        header:true,
                        content: <Loader loadPath="/menu/Edit" import={GetModules} callback={()=>{
                            getData(1)
                        }}/>,
                        width:'600px',
                    })
                }}>添加菜单</Button>
            </div>
            <hr />
            <div className="comm-form">
                <Form onChange={(field,val)=>{
                    setConditions({...conditions,[field]:val})
                }}>
                    <Input field='name' placeholder="菜单名查找" data={conditions.name ?? ''} />
                </Form>
            </div>
            
            <div>
                <Table headerTheme={Theme.primary} loading={loading} hover select={false} tree emptyText="没有数据" data={list}>
                <TableHeader field="id" text="ID" />
                    <TableHeader field="sort" text="排序" />
                    <TableHeader field="icon" text="图标" align='center' onFormat={(val)=>{
                        if (!val) return "-"
                        return <Icon icon={val}/>
                    }} />
                    <TableHeader field="text" text="菜单文字" tree/>
                    <TableHeader field="name" text="菜单名"/>
                    <TableHeader field='link' text="跳转地址" onFormat={(val)=>{
                        if (!val) return <span className='badge bg-secondary'>无</span>
                        return val
                    }}/>
                    <TableHeader field="step" text="提示栏" align='center' onFormat={(val)=>{
                        return val?<Icon icon="check-square"/>:''
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
                            if (!val) return <div className='badge bg-secondary'>无</div>;
                            return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        }}
                    />
                    <TableHeader field="modified_date" text="操作" align='center' onFormat={(val,row)=>{
                        return <>
                        <Button onClick={()=>{
                            modal.current?.view({
                                title:"修改菜单",
                                header:true,
                                content: <Loader loadPath="/menu/Edit" id={row.id} import={GetModules}/>,
                                width:'600px',
                            })
                        }} size='sm' theme={Theme.success}>修改</Button>
                        </>
                    }}/>
                </Table>
                {/* <Pagination
                    count={count}
                    current={page}
                    number={30}
                    showPages={10}
                    onSelect={(page, showNumber) => {
                        getData(page);
                    }}
                /> */}
            </div>
            <Modal ref={modal} />
        </Card>
    );
}
