import { Button, Card, CKModal, Form, Input, Load, Modal } from "@clake/react-bootstrap4";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Fetch from "../common/Fetch";
import { Response } from "../common/Common";

interface InitData {
    user?:string,
    password?:string,
    confirm?:string
}

export default function Setup(props:any):any {
    const [loading,setLoading] = useState(false) //是否加载中
    const [init,setInit] = useState<boolean|null>(null) //是否已初始化
    const [data,setData] = useState<InitData>({})
    const modal = useRef<CKModal>(null)
    const form = useRef<Form>(null)
    const navi = useNavigate()
    useEffect(()=>{
        Fetch("/serv/setup/is",{},(res:Response)=>{
            if (res.status) {
                setInit(res.data)
            }
        })
    },[])

    function submit() {
        if (!form.current?.check()) {
            modal.current?.alert('请完成必要的数据填写')
            return
        }
        setLoading(true)
        Fetch("/serv/setup/init",data,(res:Response)=>{
            if (res.status) {
                modal.current?.alert("初始化成功",()=>{
                    navi('/')
                })
            } else {
                modal.current?.alert("初始化失败："+res.msg)
            }
        },(err)=>{
            modal.current?.alert("初始化失败："+err.toString())
        })
    }

    if (init === null) {
        return <>
            <Load>正在加载中...</Load>
        </>
    }

    if (init === true) {
        navi('/')    
    }
    
    return <div className="container">
        <Card header="初始化用户数据" className="mt-3">
            <Form ref={form} onChange={(field,val,row)=>{
                setData({...data,[field]:val})
            }}>
                <Input label='用户名' field="user" placeholder="填写管理员用户名" data={data?.user} validate={{text:"用户名必需为6个字符以上，可以为中文",rule:/^[\S]{5,}$/}}/>
                <Input label='密码' field="password" placeholder="填写管理员密码" data={data?.password} type="password" validate={{text:"请填写密码",rule:/.+/}}/>
                <Input label='确认密码' field="confirm" placeholder="再次填写密码" data={data?.confirm} type="password" validate={{text:"两次密码不一致",rule:(val)=>{
                    return val === data.password
                }}}/>
            </Form>
            <Button loading={loading} onClick={()=>{
                submit()
            }}>确定初始化</Button>
        </Card>
        <Modal ref={modal}/>
    </div>
}