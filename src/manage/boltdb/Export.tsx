import { Button, CKModal, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useCallback, useEffect, useRef, useState } from "react"
import Fetch from "../../common/Fetch"
import { Response } from "../../common/Common"
import dayjs from "dayjs"
import download from "downloadjs"

export default function Export() {
    const [list,setList] = useState<any[]>([])
    let modal = useRef<CKModal>(null)
    useEffect(()=>{
        Fetch("/serv/bolt/task_list",{},(res:Response)=>{
            if (res.status) {
                setList(res.data)
            }
        })
    },[])

    const down = useCallback((url:string,name:string)=>{
        modal.current?.loading("正在下载文件")
        const postData = new FormData()
        postData.append('f',url)
        return fetch(url, {
            method: 'POST',
            mode: "cors",
            body: postData
        }).then(function(resp) {
            if (!resp.ok) {
                throw new Error(resp.statusText);
            }
            return resp.blob();
        }).then(function(blob) {
            download(blob,name);
            modal.current?.close();
        }).catch(function(err) {
            modal.current?.alert("下载出错:"+err);
        });
    },[])
    // function down(url:string,name:string) {
    //     return fetch(url, {
    //         method: 'GET',
    //     }).then(function(resp) {
    //         return resp.blob();
    //     }).then(function(blob) {
    //         download(blob,name);
    //     }).catch(function(err) {
    //         console.log(err);
    //     });
    // }

    return <>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="没有导出任务" data={list}>
            <TableHeader field="name" text="任务名"/>
            <TableHeader field="table" text="表名"/>
            <TableHeader field="status" text="导出状态"/>
            <TableHeader field="created_date"
                text="创建时间"
                onFormat={(val) => {
                    if (!val) return '';
                    return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                }}
            />
            <TableHeader field="compelete_date"
                text="完成时间"
                onFormat={(val) => {
                    if (!val) return '';
                    return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                }}
            />
            <TableHeader field="file_path" align="center" text="下载文件" onFormat={(val)=>{
                if (!val) return '';
                return <Button size="sm" onClick={()=>{
                    // console.log(val.split("/").pop())
                    down('/serv/bolt/down?f='+val,val.split("/").pop())
                }}>下载</Button>
                // return <a href={'/front/bolt/down?f='+val} target="_blank" className="btn btn-primary btn-sm">下载</a>
            }}/>
        </Table>
        <Modal ref={modal} center fade/>
    </>
}