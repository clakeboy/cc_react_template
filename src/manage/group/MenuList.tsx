import { 
    Button,
    Icon,
    Table, TableHeader, Theme 
} from "@clake/react-bootstrap4";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import { useEffect, useRef, useState } from "react";

interface Props{
    selectedList:number[]
    callback?:(list:number[])=>void
}
export default function MenuList(props:Props):any{
    const [menuList,setMenuList] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedList,setSelectedList] = useState<number[]>([])
    const table = useRef<Table>(null)
    useEffect(()=>{
        getGroupData()
    },[])

    useEffect(()=>{
        table.current?.setSelectRows("id",props.selectedList??[])
    },[menuList,props.selectedList])
    function getGroupData() {
        setLoading(true)
        Fetch("/serv/menu/query",{page:1,number:1000},(res:Response)=>{
            setLoading(false)
            if (res.status) {
                setMenuList(res.data)
            }
        })
    }

    function selectHandler() {
        const list = table.current?.getSelectRows()
        if (props.callback && list) {
            const rows = list.map(item=>item.id)
            props.callback(rows)
        }        
    }

    return <div>
        <div className="mb-2">
            <Button theme={Theme.success} onClick={selectHandler}>确定选择</Button>
        </div>
        <div>
            <Table ref={table} loading={loading} serialNumber={false} select hover headerTheme={Theme.primary} emptyText="没有数据" data={menuList}>
                <TableHeader field="sort" text="排序" />
                <TableHeader field="icon" text="图标" align='center' onFormat={(val)=>{
                    if (!val) return "-"
                    return <Icon icon={val}/>
                }} />
                <TableHeader field="text" text="菜单文字" tree/>
                <TableHeader field="name" text="菜单名"/>
            </Table>
        </div>
    </div>
}