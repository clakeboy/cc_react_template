import { Button, CKModal, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useEffect, useRef, useState } from "react"
import Fetch from "../../common/Fetch"
import { Response } from "../../common/Common"
import dayjs from "dayjs"
import download from "downloadjs"

interface BackupFile {
    name: string
    path: string
    size: number
    modify_time: number
}

export default function BackupList() {
    const [list, setList] = useState<BackupFile[]>([])
    let modal = useRef<CKModal>(null)

    useEffect(() => {
        Fetch("/serv/bolt/backup_list", {}, (res: Response) => {
            if (res.status) {
                setList(res.data)
            }
        })
    }, [])

    const down = (url: string, name: string) => {
        modal.current?.loading("正在下载文件")
        return fetch(url, {
            method: 'POST',
            mode: "cors",
        }).then(function(resp) {
            if (!resp.ok) {
                throw new Error(resp.statusText);
            }
            return resp.blob();
        }).then(function(blob) {
            download(blob, name);
            modal.current?.close();
        }).catch(function(err) {
            modal.current?.alert("下载出错:" + err);
        });
    }

    const formatSize = (size: number) => {
        if (size < 1024) return size + ' B'
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
        if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    }

    return <>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="没有备份文件" data={list}>
            <TableHeader field="name" text="文件名"/>
            <TableHeader field="size" text="文件大小" onFormat={(val: number) => formatSize(val)}/>
            <TableHeader field="modify_time" text="修改时间" onFormat={(val: number) => {
                if (!val) return '';
                return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
            }}/>
            <TableHeader field="" align="center" text="下载" onFormat={(val, row: BackupFile) => {
                return <Button size="sm" onClick={() => {
                    down('/serv/bolt/backup_download?f=' + row.path, row.name)
                }}>下载</Button>
            }}/>
        </Table>
        <Modal ref={modal} center fade/>
    </>
}
