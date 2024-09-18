import { Button, CKModal, Form, Input, Modal, Theme } from "@clake/react-bootstrap4";
import { useEffect, useRef, useState } from "react";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";
import {t} from 'i18next'
interface Data {
    id?:number
    passwd?: string
    comfirm?: string
} 

interface Props {
    id?:number
    callback?:()=>void
    parent?: CKModal
}

export default function Edit({id,callback,parent}:Props):any {
    const [data,setData] = useState<Data>({})
    let modal = useRef<CKModal>(null);
    let form = useRef<Form>(null);
    useEffect(()=>{
        
    },[id])

    function changeHandler(field:any,val:any,row:any) {
        setData({...data,[field]:val})
    }

    function saveData() {
        if (!form.current?.check()) {
            return
        }
        modal.current?.loading(t('user.save'))
        Fetch('/serv/login/change_password',{id:id,password:data.passwd},(res:Response)=>{
            modal.current?.close();
            if (res.status) {
                setData({})
                modal.current?.alert(t(''),()=>{
                    parent?.close()
                })
            } else {
                modal.current?.alert(t('err')+res.msg)
            }
        });
    }

    return (
        <div>
            <Form onChange={changeHandler} ref={form}>
                <Input label={t('user.password')} validate={{rule:/.+/,text:t('user.passvalid')}} placeholder={t('user.passempty')} field="passwd" type="password" data={data.passwd}/>
                <Input field="comfirm" validate={{rule:(val)=>{
                    return val === data.passwd
                },text:t('user.confirmvalid')}} placeholder={t('user.confirm')} type="password" data={data.comfirm}/>
            </Form>
            <div className="mt-3">
                <Button className="float-end" icon="save" theme={Theme.success} onClick={()=>{
                    saveData()
                }}>{t('confirm')}</Button>
            </div>
            <Modal ref={modal}/>
        </div>
    )
}