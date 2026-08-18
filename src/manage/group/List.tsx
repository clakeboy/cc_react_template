import {
    Button,
    ButtonGroup,
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
import { useCallback, useEffect, useRef, useState } from 'react';
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
        console.log(props.user)
        props.setTitle && props.setTitle('后台用户分组管理')
    }, []);

    function getUserData(page: number) {
        setLoading(true)
        Fetch('/serv/group/query', { page: page, number: 30, query: buildCondition(conditions) }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setList(res.data.list);
                setCount(res.data.count);
                setPage(page);
            } else {
                if (res.msg && res.msg.toLowerCase().includes('not found')) return;
                modal.current?.alert('数据获取出错：' + res.msg);
            }
        });
    }

    function reIndex() {
        setLoading(true)
        Fetch('/serv/group/reindex', { }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                getUserData(1);
            } else {
                if (res.msg && res.msg.toLowerCase().includes('not found')) return;
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
                        getUserData(1);
                    }}>
                    查询
                </Button>
                <Button icon="trash-alt" outline theme={Theme.danger}>
                    清除
                </Button>
                <Button className='ms-1' onClick={()=>{
                    reIndex()
                }} icon='wrench' tip='重建索引' theme={Theme.link}/>
                <Button className='float-end' theme={Theme.success} onClick={()=>{

                    modal.current?.view({
                        title:"添加用户组",
                        header:true,
                        content: <Loader loadPath="/group/Edit" import={GetModules}/>,
                        width:'400px',
                    })
                }}>添加分组</Button>
            </div>
            <hr />
            <div className="comm-form">
                <Form onChange={(field, val, row, combo) => {
                    if (combo) {
                        setConditions({ ...conditions, [field]: row ? row.value : val });
                    } else {
                        setConditions({ ...conditions, [field]: val });
                    }
                }}>
                    <Input field='name' placeholder="用户组名查找" data={conditions.name ?? ''} />
                </Form>
            </div>
            
            <div>
                <Table width='100%' loading={loading} hover select={false} headerTheme={Theme.primary} emptyText="没有数据" data={list}>
                    <TableHeader align='center' width='100px' field="id" text="组Id" />
                    <TableHeader align='left' width='200px' field="name" text="用户组名" />
                    <TableHeader
                        align='center'
                        width='180px'
                        field="created_date"
                        text="创建时间"
                        onFormat={(val) => {
                            if (!val) return '';
                            return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        }}
                    />
                    <Table.Header
                        align='center'
                        width='180px'
                        field="modified_date"
                        text="修改时间"
                        onFormat={(val) => {
                            if (!val) return '';
                            return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                        }}
                    />
                    <TableHeader afterHold field="modified_date" text="操作" align='center' width='100px' onFormat={(val,row)=>{
                        return <ButtonGroup>
                        <Button onClick={()=>{
                            modal.current?.view({
                                title:"修改用户组",
                                header:true,
                                content: <Loader loadPath="/group/Edit" id={row.id} import={GetModules}/>,
                                width:'400px',
                            })
                        }} size='sm' theme={Theme.success}>修改</Button>
                        </ButtonGroup>
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
