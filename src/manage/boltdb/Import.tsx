import { Button, CKModal, Input, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useEffect, useRef, useState } from "react"
import Fetch from "../../common/Fetch"
import { Response } from "../../common/Common"

interface Props {
    data:any[] //要导入的数据
    table:string //当前打开的表名
}

const importNum = 100

export default function Import({data,table}:Props) {
    const [list,setList] = useState<any[]>([])
    const [headers,setHeaders] = useState<string[]>([])
    const [loading,setLoading] = useState<boolean>(false)
    const [msg,setMsg] = useState<string>('')
    const [tableName,setTableName] = useState<string>('')
    const [dataName,setDataName] = useState<string>('')
    let page = useRef<number>(1)
    let modal = useRef<CKModal>(null)
    useEffect(()=>{
        if (data.length > 0) {
            const row = data[0]
            const headlist:string[] = []
            for (const key in row) {
                headlist.push(key)
            }
            headlist.sort()
            setHeaders(headlist)
            setList(data)
        } else {
            setList([])
        }
    },[data])

    useEffect(()=>{
        const tmp = table.split("|")
        setTableName(tmp[0])
        setDataName(tmp[1])
    },[table])

    function startImport(nextPage:number) {
        if (tableName === '' || dataName === '') {
            modal.current?.alert('表名或数据结构名不能为空')
            return
        }
        page.current = nextPage
        setLoading(true)
        setMsg('正在导入第'+nextPage+'页')
        let start = (nextPage-1) * importNum
        let end = start + importNum
        process([tableName,dataName],list.slice(start,end))
    }

    function process(table:string[],pageData:any[]) {
        if (pageData.length === 0) {
            setLoading(false)
            setMsg("导入完成")
            return
        }
        Fetch("/serv/bolt/import",{table:table,data:pageData},(res:Response)=>{
            if (res.status) {
                startImport(page.current+1)
            } else {
                setLoading(false)
                setMsg(`导入数据出错：第（${page.current}）页，${res.msg}`)
            }
        })
    }

    function testImport() {
        const pNum = 10
        const count = 234
        let list:any[] = []
        for (let i = 0; i < count; i++) {
            list.push(i+1)
        }

        let pages = Math.trunc(count / pNum)
        if (count % pNum > 0) {
            pages++
        }

        for (let i = 1; i <= pages+1; i++) {
            let start = (i-1) * pNum
            let end = start + pNum
            console.log(list.slice(start,end))
        }
    }

    return <>
        <div className="comm-form">
            <Input placeholder="表名" data={tableName} width="200px" validate={{text:"表名必需填写",rule:/.+/}} onChange={(val)=>{
                setTableName(tableName)
            }}/>
            <Input placeholder="数据结构名" data={dataName} width="200px" validate={{text:"数据结构名必需填写",rule:/.+/}} onChange={(val)=>{
                setDataName(dataName)
            }}/>
        </div>
        <div className="mb-2">
            <Button className="me-5" loading={loading} onClick={()=>{
                startImport(1)
            }}>开始导入</Button>
            <span>{msg}</span>
        </div>
        <div>数据预览</div>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="选择数据导入" data={list}>
            {headers.map((key)=>{
                return <TableHeader key={key} text={key} field={key}></TableHeader>
            })}
        </Table>
        <Modal ref={modal} center fade/>
    </>
}