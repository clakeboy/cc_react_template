import {
    Button,
    CKModal,
    ComboBox,
    Common,
    Icon,
    Input,
    Menu,
    MenuItem,
    Modal,
    Pagination,
    Table,
    Theme,
    Tree,
} from '@clake/react-bootstrap4';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Fetch from '../../common/Fetch';
import { Condtion, Response } from '../../common/Common';
import Loader from '../../components/Loader';
import '../../assets/css/boltdb.less'
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import Edit from './Edit';
import MetadataEdit from './MetadataEdit';
import BackupList from './BackupList';
import SqlConsole from './SqlConsole';
import { GetModules } from '../../common/Funcs';

interface conditions {
    name?: string;
}

interface Condition {
    field:string,
    type:string,
    value:string,
    index:boolean
}

interface Header {
    name:string
    type:string
}

interface DatabaseNode {
    key: string
    text: string
    type?: string
    from?: string
    table?: string
    sql?: boolean
    children?: DatabaseNode[]
}

function Hump2Under(str:string):string {
    let reg:RegExp = /[A-Z]{1}[a-z0-9]+/gm
    const list = str.match(reg)
    const result:string[] = []
    list?.forEach((item)=>{
        result.push(item.toLowerCase())
    })
    
    return result.join("_")
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
// dragSplitHandler 已移至组件内部实现以方便访问 ref 和 DOM 元素

function getSqlTableNames(nodes: DatabaseNode[]): string[] {
    const names:string[] = [];
    const walk = (items: DatabaseNode[]) => {
        items?.forEach((item) => {
            if (item.table && !names.includes(item.table)) {
                names.push(item.table);
            }
            if (item.children) {
                walk(item.children);
            }
        });
    };
    walk(nodes);
    names.sort();
    return names;
}

// formatBoltCellValue 统一处理 BoltDB 表格单元格显示。
// 普通 db.Set 可能保存字符串、数字、布尔、数组或对象，不能直接把原值作为 React child 渲染。
function formatBoltCellValue(val:any, viewJson:(obj:any)=>void): any {
    if (val === null || val === undefined || val === '') {
        return '';
    }
    if (Array.isArray(val)) {
        if (val.length === 0) {
            return <span className='badge bg-secondary'>empty</span>
        }
        return <Button size='sm' onClick={()=>{
            viewJson(val)
        }}>查看对象</Button>
    }
    if (typeof val === 'object') {
        if (Object.keys(val).length === 0) {
            return <span className='badge bg-secondary'>empty</span>
        }
        return <Button size='sm' onClick={()=>{
            viewJson(val)
        }}>查看对象</Button>
    }
    if (typeof val === 'number' && val.toString().length === 10) {
        return <>
            {dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss')}<br/>
            <span className='text-primary'>{val}</span>
        </>
    }
    const text = String(val);
    if (text.length > 100) {
        return <Button theme={Theme.link} className='text-break' onClick={()=>{
            viewJson(text)
        }}>{text.substring(0,100)} ...</Button>
    }
    return <span className='text-break'>{text}</span>
}

export default function List(props: any): any {
    const [dbList, setDbList] = useState<{name:string, path:string}[]>([]);
    const [selectedDb, setSelectedDb] = useState<string>('sys.db');
    const [database, setDatabase] = useState<any[]>([]);
    const [list, setList] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false)
    const [header, setHeader] = useState<Header[]>([]);
    const [hiddenPagebar, setHiddenPagebar] = useState(false);
    const [comboField, setComboField] = useState<any[]>([]);
    const [filterColumn, setFilterColumn] = useState<Header>();
    const [filterIndex, setFilterIndex] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [filter,setFilter] = useState<Condition[]>([])
    const [idxList,setIdxList] = useState<string[]>([]);
    const [selectedFrom,setSelectedFrom] = useState<string>('');
    const [showSqlConsole,setShowSqlConsole] = useState<boolean>(true);
    const [isSqlMode, setIsSqlMode] = useState<boolean>(false);
    const sqlTableNames = getSqlTableNames(database);
    let modal = useRef<CKModal>(null);
    let menu = useRef<Menu>(null);
    let tableName = useRef<string>('');
    let table = useRef<Table>(null);
    let split = useRef<HTMLDivElement>(null);
    const selectedDbRef = useRef<string>('sys.db');

    function dragSplitHandler(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const startX = e.clientX;
        const mainEl = e.currentTarget.parentElement;
        if (!mainEl) return;
        
        const listEl = mainEl.querySelector('.db-list') as HTMLDivElement;
        const splitEl = e.currentTarget as HTMLDivElement;
        if (!listEl || !splitEl) return;

        const startWidth = listEl.offsetWidth;
        splitEl.classList.add('dragging');

        const doDrag = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = startWidth + deltaX;
            if (newWidth >= 150 && newWidth <= 800) {
                listEl.style.width = `${newWidth}px`;
                mainEl.style.gridTemplateColumns = `${newWidth}px 1fr`;
                splitEl.style.left = `${newWidth - 10}px`;
            }
        };

        const stopDrag = () => {
            splitEl.classList.remove('dragging');
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    useEffect(() => {
        getDbList();
        props.setTitle && props.setTitle('数据管理')
        document.getElementById("bolt-main")?.addEventListener("drop",drophandler,false)
        
        return ()=>{
            document.getElementById("bolt-main")?.removeEventListener("drop",drophandler,false)
        }
    }, []);

    useEffect(()=>{
        if (header&&header.length > 0) {
            let list = header.map((val:any,idx)=>{
                const is_idx = idxList.includes(val.name)
                return {
                    'name': val.name,
                    'type': val.type,
                    'index': is_idx?'*':'',
                    'is_index':is_idx,
                }
            })
            setComboField(list)
        } else {
            setComboField([])
        }
    },[header])

    function getDbList() {
        Fetch('/serv/bolt/db_list', {}, (res: Response) => {
            if (res.status) {
                setDbList(res.data);
                const hasSys = res.data.some((item: any) => item.name === 'sys.db');
                if (hasSys) {
                    selectedDbRef.current = 'sys.db';
                    setSelectedDb('sys.db');
                    getMainTables('sys.db');
                } else if (res.data.length > 0) {
                    selectedDbRef.current = res.data[0].name;
                    setSelectedDb(res.data[0].name);
                    getMainTables(res.data[0].name);
                }
            } else {
                modal.current?.alert('数据获取出错：' + res.msg);
            }
        });
    }

    function handleDbChange(dbName: string) {
        selectedDbRef.current = dbName;
        setSelectedDb(dbName);
        setDatabase([]);
        setList([]);
        setHeader([]);
        setCount(0);
        setFilterColumn(undefined);
        setFilterValue('');
        setSelectedFrom('');
        tableName.current = '';
        getMainTables(dbName);
    }

    function getMainTables(dbName: string = selectedDb) {
        setLoading(true)
        Fetch('/serv/bolt/databases', { db: dbName }, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setDatabase(res.data);
            } else {
                if (res.msg && res.msg.toLowerCase().includes('not found')) return;
                modal.current?.alert('数据获取出错：' + res.msg);
            }
        });
    }

    function getTableData(name:string,page:number,conds:any[]|null=[]) {
        if (!name) {
            return;
        }
        setLoading(true)
        tableName.current = name
        if (filterColumn && conds !== null) {
            conds.push({
                field: filterColumn.name,
                type: 'eq',
                value: filterColumn.type === 'string'?filterValue:parseFloat(filterValue),
                index: filterIndex,
            })
        }
        Fetch('/serv/bolt/query', {db:selectedDb, table:name,page:page,number:50,query:conds}, (res: Response) => {
            setLoading(false)
            if (res.status) {
                setPage(page)
                setCount(res.data.count)
                setHeader(res.data.header)
                setList(res.data.list)
            } else {
                if (res.msg && res.msg.toLowerCase().includes('not found')) return;
                modal.current?.alert('数据获取出错：' + res.msg);
            }
        });
    }

    async function drophandler(e:DragEvent) {
        e.preventDefault();
        if (!e.dataTransfer?.files.length) {
            return;
        }
        modal.current?.loading("处理数据中...")
        try {
            const file = e.dataTransfer?.files[0];
            if (!file.name.endsWith('.json')) {
                modal.current?.alert("请拖入JSON文件")
                return
            }
            
            const data = await file.arrayBuffer();
            const de = new TextDecoder()
            const jsonstr = de.decode(data)
            const list:any[] = JSON.parse(jsonstr);
            modal.current?.view({
                header:true,
                title:"数据导入",
                width:'80%',
                content: <Loader loadPath="/boltdb/import" db={selectedDb} table={file.name.split(".")[0]} data={list} import={GetModules}/>,
            })
        } catch(e) {

        }
    }

    function exportDate(name:string,page:number,conds:any[]|null=[]) {
        if (!name) {
            modal.current?.alert('请先打开需要导出的数据库表')
            return
        }
        modal.current?.loading("发送导出任务")
        tableName.current = name
        if (filterColumn && conds !== null) {
            conds.push({
                field: filterColumn.name,
                type: 'eq',
                value: filterColumn.type === 'string'?filterValue:parseFloat(filterValue),
                index: filterIndex,
            })
        }
        Fetch("/serv/bolt/export",{db:selectedDb, table:name,page:page,number:1000,query:conds},(res:Response)=>{
            if (res.status) {
                modal.current?.alert("导出任务已提交，请稍后查看导出任务列表")
            } else {
                modal.current?.alert("导出任务提交失败："+res.msg)
            }
        })
    }

    function openExport() {
        modal.current?.view({
            header:true,
            title:"数据导出任务列表",
            width:'80%',
            content: <Loader loadPath="/boltdb/export" import={GetModules}/>,
        })
    }

    function viewJson(obj:any) {
        modal.current?.view({
            title:"查看内容",
            width:'80%',
            content:<JsonView data={obj}/>,
            shadowClose:true,
        })
    }

    function edit(row:any) {
        modal.current?.view({
            header:true,
            title:"修改数据",
            width:'80%',
            content:<Edit db={selectedDb} id={parseInt(row.id)} table={tableName.current} text={JSON.stringify(row,null,2)}/>,
            // shadowClose:true,
        })
    }

    function startBackup() {
        Fetch("/serv/bolt/backup_current", {}, (res: Response) => {
            if (res.status) {
                modal.current?.alert("备份任务已提交，请稍后查看备份任务列表")
            } else {
                modal.current?.alert("备份任务提交失败：" + res.msg)
            }
        })
    }

    function openBackupList() {
        modal.current?.view({
            header:true,
            title:"备份管理("+selectedDbRef.current+")",
            width:'80%',
            content: <BackupList db={selectedDbRef.current} random={Common.RandomString(10)}/>,
        })
    }

    function deleteData() {
        let list = table.current?.getSelectRows()
        if (list && list.length > 0) {
            modal.current?.confirm({
                title:"警告",
                content:"确定要删除选中的数据吗？",
            },(flag)=>{
                if (flag) {
                    let ids = list?.map(item=>item.id)
                    Fetch("/serv/bolt/delete",{db:selectedDb, table:tableName.current,id_list:ids},(res:Response)=>{
                        if (res.status) {
                            getTableData(tableName.current,page,[])
                        } else {
                            modal.current?.alert("删除出错："+res.msg)
                        }
                    })
                }
            })
        } else {
            modal.current?.alert("请先选择要删除的数据")
        }
    }

    function deleteTable(tableName:string) {
        modal.current?.confirm({
            content:"确定删除这个数据表？删除后，数据将无法恢复！"
        },(flag)=>{
            if (flag) {
                Fetch('/serv/bolt/delete_bucket', { db: selectedDb, name: tableName }, (res: Response) => {
                    if (res.status) {
                        getMainTables();
                    } else {
                        modal.current?.alert('删除数据表出错：' + res.msg);
                    }
                })
            }
        })
    }

    function viewStats() {
        Fetch('/serv/bolt/stats', { db: selectedDb }, (res: Response) => {
            if (res.status) {
                const stats = res.data;
                const txStats = stats.tx_stats || {};
                const tableData = [
                    { name: 'Free Pages (空闲页面)', value: stats.free_page_n || 0 },
                    { name: 'Pending Pages (待处理页面)', value: stats.pending_page_n || 0 },
                    { name: 'Free Alloc (空闲分配)', value: stats.free_alloc || 0 },
                    { name: 'Freelist In Use (空闲列表使用)', value: stats.freelist_in_use || 0 },
                    { name: 'Total TX (事务总数)', value: stats.tx_n || 0 },
                    { name: 'Open TX (打开事务)', value: stats.open_tx_n || 0 },
                    { name: 'TX Page Count (事务页面数)', value: txStats.page_count || 0 },
                    { name: 'TX Page Alloc (事务页面分配)', value: txStats.page_alloc || 0 },
                    { name: 'Cursor Count (游标数)', value: txStats.cursor_count || 0 },
                    { name: 'Node Count (节点数)', value: txStats.node_count || 0 },
                    { name: 'Node Deref (节点解引用)', value: txStats.node_deref || 0 },
                    { name: 'Rebalance (再平衡)', value: txStats.rebalance || 0 },
                    { name: 'Split (分裂)', value: txStats.split || 0 },
                    { name: 'Spill (溢出)', value: txStats.spill || 0 },
                    { name: 'Write (写入)', value: txStats.write || 0 },
                ];
                modal.current?.view({
                    title:"BoltDB 状态统计 (Database Stats)",
                    width:'600px',
                    content:(
                        <Table headerTheme={Theme.primary} sm headerAlign='center' data={tableData}>
                            <Table.Header align='left' field='name' text='统计项 (Statistic)' />
                            <Table.Header align='right' field='value' text='数值 (Value)' />
                        </Table>
                    ),
                    shadowClose:true,
                })
            } else {
                modal.current?.alert('获取状态信息出错：' + res.msg);
            }
        });
    }

    function openMetadataEdit(tblName?: string) {
        const targetTable = tblName || tableName.current;
        if (!targetTable) {
            modal.current?.alert('请先选择一个数据表');
            return;
        }
        modal.current?.view({
            header: true,
            title: `管理表元数据 [${targetTable}]`,
            width: '80%',
            content: <MetadataEdit db={selectedDbRef.current} table={targetTable} />,
        });
    }

    function reIndexTable(tblName: string) {
        modal.current?.confirm({
            title: "确认操作",
            content: `确定要刷新数据表 [${tblName}] 的索引吗？这将会清空并重新扫描生成该表的所有索引字段数据。`,
        }, (flag) => {
            if (flag) {
                modal.current?.loading("正在刷新索引...");
                Fetch('/serv/bolt/re_index', {
                    db: selectedDbRef.current,
                    table: tblName,
                }, (res: Response) => {
                    modal.current?.close();
                    if (res.status) {
                        modal.current?.alert("索引刷新成功！");
                    } else {
                        modal.current?.alert("刷新索引失败：" + res.msg);
                    }
                });
            }
        });
    }

    return (
        <div className='boltdb h-100' id='bolt-main' onDragOver={(e)=>{
            e.preventDefault();
        }}>
            <div className='boltdb-tools'>
                <div className="filter comm-form">
                    <Button size='sm' icon='tasks' theme={Theme.info} tip='备份管理' onClick={()=>{
                        openBackupList()
                    }}></Button>
                    <Button size='sm' icon='plus' theme={Theme.primary} tip='导入数据' onClick={()=>{
                        document.getElementById('bolt-main')?.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
                    }}></Button>
                    <Button size='sm' icon='chart-bar' theme={Theme.warning} tip='查看数据库状态' onClick={()=>{
                        viewStats()
                    }}></Button>
                    <Button size='sm' icon='terminal' theme={showSqlConsole?Theme.primary:Theme.secondary} tip='SQL 执行管理' onClick={()=>{
                        setShowSqlConsole(!showSqlConsole)
                    }}></Button>
                    <Button size='sm' className='ms-auto' icon='sync-alt' tip='刷新列表' onClick={()=>{
                        getMainTables()
                    }}></Button>
                </div>
                <div className='comm-form'>
                    <span>条件: </span>
                    <ComboBox showRows={10} header={false} data={comboField} size='sm' placeholder='查询字段' width='250px' value={filterColumn?.name} searchColumn='name' onChange={(val,row)=>{
                        setFilterColumn(row?row:undefined)
                        setFilterIndex(row?row.is_index:false)
                    }}>
                        <ComboBox.Column field='name' text='查询字段' width='150px'/>
                        <ComboBox.Column field='type' text='数据类型' width='60px'/>
                        <ComboBox.Column field='index' text='索引' width='20px'/>
                    </ComboBox>
                    <span> = </span>
                    <Input size='sm' data={filterValue} onChange={(val)=>{
                        setFilterValue(val)
                    }}/>
                    <Button size='sm' icon='search' onClick={()=>{
                        getTableData(tableName.current,1)
                    }}>查询</Button>
                    <Button size='sm' icon='sync-alt' tip='重置并刷新' onClick={()=>{
                        setFilterColumn(undefined)
                        setFilterValue('')
                        setFilterIndex(false)
                        getTableData(tableName.current,1,null)
                    }}></Button>
                    <Button size='sm' tip='删除选中数据' icon='trash-alt' theme={Theme.danger} onClick={()=>{
                        deleteData()
                    }}/>
                    <Button size='sm' icon='share-square' theme={Theme.warning} tip='导出当前数据' onClick={()=>{
                        exportDate(tableName.current,1,null)
                    }}></Button>
                    <Button size='sm' icon='cog' theme={Theme.info} tip='编辑当前表元数据(Metadata)' onClick={()=>{
                        openMetadataEdit()
                    }}></Button>
                    <Button size='sm' theme={Theme.success} className='ms-auto' icon='download' onClick={()=>{
                        openExport()
                    }}></Button>
                </div>
            </div>
            <div className='boltdb-main'>
                <div className='db-list d-flex flex-column h-100'>
                    <div className="p-2 border-bottom">
                        <ComboBox showRows={10} header data={dbList} size='sm' placeholder='请选择数据库文件' width='500px' value={selectedDb} searchColumn='name' onChange={(val,row)=>{
                            if (row) {
                                handleDbChange(row.name);
                            }
                        }}>
                            <ComboBox.Column field='name' text='数据库文件' width='200px'/>
                            <ComboBox.Column field='path' text='数据库路径' width='300px'/>
                        </ComboBox>
                    </div>
                    <div className="flex-grow-1 overflow-auto">
                        <Tree width='300px' data={database} onMenu={(e,data:DatabaseNode,id)=>{
                            e.preventDefault()
                            // console.log(data,id)
                            menu.current?.show({evt:e,type:"mouse",data:data})
                        }} onClick={(e,data:DatabaseNode,id)=>{
                            if (data.children) {
                                const idxList:string[] = [];
                                data.children.forEach((item:any)=>{
                                    const text:string = item.text
                                    if (text.indexOf('__storm_index_') !== -1) {
                                        idxList.push(Hump2Under(text.substring(14)))
                                    }
                                })
                                setIdxList(idxList)
                            }
                            if (data.children && data.type !== 'schema_table') {
                                setSelectedFrom(data.from || data.key || '')
                                return
                            }
                            setSelectedFrom(data.from || '')
                            setIsSqlMode(false)
                            getTableData(data.key,1)
                            setFilterColumn(undefined)
                            setFilterValue('')
                        }}/>
                    </div>
                </div>
                <div className='db-main'>
                    {showSqlConsole ? <SqlConsole db={selectedDb} from={selectedFrom} table={tableName.current} fields={header} tables={sqlTableNames} page={page} number={50} onResult={(rows, heads, total, curPage)=>{
                        setIsSqlMode(true)
                        setPage(curPage)
                        setCount(total)
                        setHeader(heads)
                        setList(rows)
                    }} onExecuted={()=>{
                        if (tableName.current) {
                            getTableData(tableName.current,page,[])
                        }
                    }}/> : undefined}
                    <div className='bolt-table-area'>
                        <Table ref={table} headerTheme={Theme.primary} sm headerAlign='center' loading={loading} striped={false} width='100%' height='100%' hover select emptyText="没有数据" data={list}>
                            <Table.Header align='center' width='50px' field='id' text='ID'/>
                            {header?header.map((item:any, index) => {
                                return <Table.Header key={index} align='center' width='180px' field={item.name} text={item.name} onFormat={(val)=>{
                                    return formatBoltCellValue(val, viewJson)
                                }}/>
                            }):undefined}
                            <Table.Header afterHold align='center' field='' onFormat={(val,row)=>{
                                return <Button size='sm' icon='search' outline onClick={()=>{
                                    edit(row)
                                }}>修改</Button>
                            }}/>
                        </Table>
                        <div className='pages d-flex'>
                            <div className='hidden-btn' onClick={()=>{
                                setHiddenPagebar(!hiddenPagebar)
                            }}>
                                <Icon className='align-items-center' icon={hiddenPagebar?'chevron-circle-left':'chevron-circle-right'}/>
                            </div>
                            <div className={hiddenPagebar?'d-none':''}>
                                <Pagination
                                    size='sm'
                                    count={count}
                                    current={page}
                                    number={50}
                                    showPages={10}
                                    onSelect={(p, showNumber) => {
                                        const parsedPage = parseInt(p);
                                        if (isSqlMode) {
                                            setPage(parsedPage);
                                        } else {
                                            getTableData(tableName.current,parsedPage);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="db-split" ref={split} onMouseDown={dragSplitHandler}/>
            </div>
            <Modal ref={modal} />
            <Menu ref={menu}>
                <MenuItem field='metadata' text='编辑元数据' onClick={(e,field,data:DatabaseNode)=>{
                    if (data.type === 'schema_table' || data.type === 'legacy') {
                        openMetadataEdit(data.key)
                    } else {
                        modal.current?.alert('当前节点不是有效的数据表')
                    }
                }}>编辑元数据</MenuItem>
                <MenuItem field='none' step/>
                <MenuItem field='reindex' text='刷新表索引' onClick={(e,field,data:DatabaseNode)=>{
                    if (data.type === 'schema_table' || data.type === 'legacy') {
                        reIndexTable(data.key)
                    } else {
                        modal.current?.alert('当前节点不是有效的数据表')
                    }
                }}>刷新表索引</MenuItem>
                <MenuItem field='none' step/>
                <MenuItem field='import' text='删除数据表' onClick={(e,field,data:DatabaseNode)=>{
                    const key = data.type === 'schema_index' && data.from && data.table ? `${data.from}|${data.table}` : data.key
                    deleteTable(key)
                }}><span className='text-danger'>删除数据表</span></MenuItem>
                <MenuItem field='none' step/>
                <MenuItem field='import' text='导入数据' onClick={(e,field,data)=>{
                }}>导入数据</MenuItem>
            </Menu>
        </div>
    );
}
