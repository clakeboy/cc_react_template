import { Button, CKModal, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useEffect, useRef, useState } from "react"
import Fetch from "../../common/Fetch"
import { Response } from "../../common/Common"
import dayjs from "dayjs"
import download from "downloadjs"

interface BackupTask {
    name: string
    status: string
    file_path: string
    file_name: string
    size: number
    created_date: number
    complete_date: number
}

export default function BackupTaskList() {
    const [list, setList] = useState<BackupTask[]>([])
    let modal = useRef<CKModal>(null)

    const loadTasks = () => {
        Fetch("/serv/bolt/backup_task_list", {}, (res: Response) => {
            if (res.status) {
                setList(res.data || [])
            }
        })
    }

    useEffect(() => {
        loadTasks()
        // 每3秒刷新一次任务列表
        const timer = setInterval(loadTasks, 3000)
        return () => clearInterval(timer)
    }, [])

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const down = (filePath: string, fileName: string) => {
        if (!filePath) return
        modal.current?.loading("正在下载文件")
        return fetch("/serv/bolt/download_backup?f=" + encodeURIComponent(filePath), {
            method: 'GET',
            mode: "cors",
        }).then(function (resp) {
            if (!resp.ok) {
                throw new Error(resp.statusText);
            }
            return resp.blob();
        }).then(function (blob) {
            download(blob, fileName);
            modal.current?.close();
        }).catch(function (err) {
            modal.current?.alert("下载出错:" + err);
        });
    }

    return <>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="没有备份任务" data={list}>
            <TableHeader field="name" text="任务名称" />
            <TableHeader field="status" text="状态" />
            <TableHeader field="size" text="文件大小" onFormat={(val) => {
                return formatFileSize(val || 0)
            }} />
            <TableHeader field="created_date"
                text="创建时间"
                onFormat={(val) => {
                    if (!val) return '';
                    return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                }}
            />
            <TableHeader field="complete_date"
                text="完成时间"
                onFormat={(val) => {
                    if (!val) return '-';
                    return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss');
                }}
            />
            <TableHeader field="file_path" align="center" text="操作" onFormat={(val, row: BackupTask) => {
                if (!val || row.status !== '备份完成') {
                    return <span className="text-muted">-</span>;
                }
                return <Button size="sm" theme={Theme.success} onClick={() => {
                    down(val, row.file_name)
                }}>下载</Button>
            }} />
        </Table>
        <Modal ref={modal} center fade />
    </>
}
