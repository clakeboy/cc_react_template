import {
    Button,
    ButtonGroup,
    CKModal,
    Card,
    Icon,
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
import {t} from 'i18next';
import * as bootstrap from 'bootstrap';

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


function applyTip() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const list = [...tooltipTriggerList].map((tooltipTriggerEl) => {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
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
        props.setTitle && props.setTitle(t('menu.shipment'))
        return ()=>{
        }
    }, []);

    useEffect(()=>{
        applyTip()
        return ()=>{

        }
    },[list])

    function getUserData(page: number) {
        setLoading(true)
        Fetch('/serv/shipment/query', { page: page, number: 30, query: buildCondition(conditions) }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setList(res.data.list);
                setCount(res.data.count);
                setPage(page);
            } else {
                modal.current?.alert(t('err') + res.msg);
            }
        });
    }

    return (
        <Card>
            <div className="mb-3 d-flex">
                <div className='d-flex border rounded'>
                    <div className='p-2 bg-warning'>In Transit</div>
                    <div className='py-2 px-3'><a href='javascript://'>3333</a></div>
                </div>
                <div className='flex-grow-1 d-flex justify-content-center'>
                    <div className='d-flex border rounded-start px-2'>
                        <div className='p-2'><Icon icon='ship'/></div>
                        <div className="p-2 text-primary"><a href='javascript://'>200</a></div>
                    </div>
                    <div className='d-flex border px-2'>
                        <div className='p-2'><Icon icon='plane'/></div>
                        <div className="p-2 text-primary">200</div>
                    </div>
                    <div className='d-flex border rounded-end px-2'>
                        <div className='p-2'><Icon icon='truck'/></div>
                        <div className="p-2 text-primary">200</div>
                    </div>
                </div>
                <div>
                    <Button className='me-1' theme={Theme.success}>Book</Button>
                    <Button className='me-1' theme={Theme.danger}>Late</Button>
                    <Button theme={Theme.secondary}>Complete</Button>
                </div>
            </div>
            <div className="comm-form mb-2">
                <Form onChange={(field,val)=>{
                    setConditions({...conditions,[field]:val})
                }}>
                    <Input size='sm' field='house_no' placeholder="House No." />
                    <Input size='sm' field='house_no' placeholder="PO No." />
                    <Input size='sm' field='master_bl_no' placeholder="Master B/L" />
                    <Input size='sm' field='house_no' placeholder="Container" />
                    <Input size='sm' field='house_no' placeholder="Booking No." />
                </Form>
                <Button icon='search' size='sm'>Search</Button>
            </div>
            <div>
                <Table headerTheme={Theme.primary} striped={false} loading={loading} hover select={false} emptyText="data is empty" data={list}>
                    <TableHeader  field="house_no" text="House No." />
                    <TableHeader field="op_type" align='center' text="Mode" onFormat={(val:string)=>{
                        if (val.toUpperCase() === "AI") {
                            return <Icon icon='plane'/>
                        }
                        return <Icon icon='ship'/>
                    }}/>
                    <TableHeader field="last_status_id" text="Status" onFormat={(val,row)=>{
                        const pross = Math.floor((val / 950)*100)
                        return <>
                            <div className='progress' data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={row.last_event_desc||'empty'}>
                                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width:pross+'%'}}>
                                    {pross+'%'}
                                </div>
                            </div>
                        </>
                    }}/>
                    <TableHeader field="loading_port" text="Loading" />
                    <TableHeader field="etd_date" text="ETD" onFormat={(val)=>{
                        return dayjs(val).format("MM-DD")
                    }}/>
                    <TableHeader field="discharge_port" text="Discharge" />
                    <TableHeader field="eta_date" text="ETA" onFormat={(val)=>{
                        return dayjs(val).format("MM-DD")
                    }}/>
                    <TableHeader field="house_place_of_delivery" text="Destination" />
                    <TableHeader field="total_package" align='right' text="Piece" />
                    <TableHeader field="house_weight_kg" align='right'  text="Wgt kg" />
                    <TableHeader field="container_count" align='center' text={<Icon icon='box'/>}/>
                    <TableHeader field="con" align='center' text={<Icon icon='laptop'/>}/>
                    <TableHeader field="con" align='center' text={<Icon icon='globe'/>}/>
                </Table>
                <Pagination
                    info={"Total: ${count}, Pages: ${page}"}
                    count={count}
                    current={page}
                    number={30}
                    showPages={10}
                    onSelect={(page, showNumber) => {
                        getUserData(parseInt(page));
                    }}
                />
            </div>
            <Modal ref={modal} />
        </Card>
    );
}
