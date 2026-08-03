import { Button, ButtonGroup, CKModal, Modal, Table, TableHeader, Theme } from "@clake/react-bootstrap4"
import { useCallback, useEffect, useRef, useState } from "react"
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

interface BackupListProps {
    random?: string
    db?: string
    parent?: CKModal
}

export default function BackupList(props: BackupListProps) {
    const [tasks, setTasks] = useState<BackupTask[]>([])
    let modal = useRef<CKModal>(null)

    const loadTasks = useCallback(() => {
        Fetch("/serv/bolt/backup_task_list", {}, (res: Response) => {
            if (res.status) {
                setTasks(res.data || [])
            }
        })
    }, [])

    useEffect(() => {
        loadTasks()
        // 每3秒刷新一次任务列表
        const timer = setInterval(loadTasks, 3000)
        if (props.parent) {
            props.parent.evtClosed = () => clearInterval(timer)
        }
    }, [loadTasks, props.random])

    const backupCurrent = useCallback(() => {
        modal.current?.confirm({
            title: "备份提示",
            content: "确定要备份当前数据库吗？",
        }, (flag: number) => {
            if (!flag) return
            modal.current?.loading("正在备份数据库...")
            Fetch("/serv/bolt/backup_current", { db: props.db }, (res: Response) => {
                if (res.status) {
                    modal.current?.close()
                    loadTasks()
                } else {
                    modal.current?.alert("备份出错:" + res.msg)
                }
            })
        })
    }, [props.db, loadTasks])

    const formatSize = (size: number) => {
        if (size < 1024) return size + ' B'
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
        if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    }

    const formatTime = (val: number) => {
        if (!val) return '-'
        return dayjs.unix(val).format('YYYY-MM-DD HH:mm:ss')
    }

    const downloadTask = (filePath: string, fileName: string) => {
        if (!filePath) return
        modal.current?.loading("正在下载文件")
        return fetch("/front/bolt/download_backup?f=" + encodeURIComponent(filePath), {
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

    const deleteTask = (row: BackupTask) => {
        modal.current?.confirm({
            title: "警告",
            content: "确定要删除备份记录「" + row.name + "」及对应的备份文件吗？",
        }, (flag: number) => {
            if (!flag) return
            Fetch("/serv/bolt/delete_backup", { file_name: row.file_name }, (res: Response) => {
                if (res.status) {
                    loadTasks()
                } else {
                    modal.current?.alert("删除出错：" + res.msg)
                }
            })
        })
    }

    return <>
        <div className="mb-3">
            <Button theme="primary" onClick={backupCurrent}>备份当前数据库</Button>
        </div>
        <h6 className="mb-2">备份任务</h6>
        <Table headerTheme={Theme.primary} hover select={false} emptyText="没有备份任务" data={tasks}>
            <TableHeader field="name" text="任务名称" />
            <TableHeader field="status" text="状态" />
            <TableHeader field="size" text="文件大小" onFormat={(val) => {
                return formatSize(val || 0)
            }} />
            <TableHeader field="created_date" text="创建时间" onFormat={(val) => formatTime(val)} />
            <TableHeader field="complete_date" text="完成时间" onFormat={(val) => formatTime(val)} />
            <TableHeader field="file_path" align="center" text="操作" onFormat={(val, row: BackupTask) => {
                return <>
                    {val && row.status === '备份完成' && <ButtonGroup>
                        <Button size="sm" theme={Theme.success} className="mr-1" onClick={() => {
                            downloadTask(val, row.file_name)
                        }}>下载</Button>
                        <Button size="sm" theme={Theme.danger} icon="trash" onClick={() => {
                        deleteTask(row)
                    }}></Button>
                    </ButtonGroup>
                    }
                </>
            }} />
        </Table>
        <Modal ref={modal} center fade/>
    </>
}
