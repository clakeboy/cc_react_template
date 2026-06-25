import { Button, CKModal, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useCallback, useEffect, useRef, useState } from "react"
import Fetch from "../../common/Fetch"
import { Response } from "../../common/Common"
import dayjs from "dayjs"

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

    const backupCurrent = useCallback(() => {
        modal.current?.loading("正在备份数据库...")
        Fetch("/serv/bolt/backup_current", {}, (res: Response) => {
            if (res.status) {
                modal.current?.close()
                Fetch("/serv/bolt/backup_list", {}, (res: Response) => {
                    if (res.status) {
                        setList(res.data)
                    }
                })
            } else {
                modal.current?.alert("备份出错:" + res.msg)
            }
        })
    }, [])

    const formatSize = (size: number) => {
        if (size < 1024) return size + ' B'
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
        if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    }

    const downloadBackup = (path: string, name: string) => {
        const link = document.createElement('a')
        link.href = '/serv/bolt/download_backup?f=' + path
        link.download = name
        link.click()
    }

    return <>
        <div className="mb-3">
            <Button theme="primary" onClick={backupCurrent}>备份当前数据库</Button>
        </div>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="没有备份文件" data={list}>
            <TableHeader field="name" text="文件名"/>
            <TableHeader field="size" text="文件大小" onFormat={(val: number) => formatSize(val)}/>
            <TableHeader field="modify_time" text="修改时间" onFormat={(val: number) => {
                if (!val) return '';
                return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
            }}/>
            <TableHeader field="" align="center" text="下载" onFormat={(val, row: BackupFile) => {
                return <Button size="sm" onClick={() => {
                    downloadBackup(row.path, row.name)
                }}>下载</Button>
            }}/>
        </Table>
        <Modal ref={modal} center fade/>
    </>
}
