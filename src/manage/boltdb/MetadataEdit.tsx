import AceEditor from "react-ace";
import { Ace, config } from "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";

import { useEffect, useRef, useState } from "react";
import { Alerts, Button, CKModal, Modal, Theme } from "@clake/react-bootstrap4";
import Fetch from "../../common/Fetch";
import { Response } from "../../common/Common";

import workerUrl from "ace-builds/src-noconflict/worker-json?url";
config.setModuleUrl("ace/mode/json_worker", workerUrl);

interface Props {
    db?: string;
    table: string;
}

export default function MetadataEdit(props: Props) {
    const [activeTab, setActiveTab] = useState<'json' | 'golang'>('json');
    const [metadata, setMetadata] = useState<any>({});
    const [jsonStr, setJsonStr] = useState<string>('');
    const [golangCode, setGolangCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const modal = useRef<CKModal>(null);
    const alt = useRef<Alerts>(null);

    useEffect(() => {
        getMetadata();
    }, [props.table, props.db]);

    function getMetadata() {
        setLoading(true);
        Fetch('/serv/bolt/get_metadata', {
            db: props.db,
            table: props.table,
        }, (res: Response) => {
            setLoading(false);
            if (res.status) {
                const data = res.data || {};
                setMetadata(data);
                setJsonStr(JSON.stringify(data, null, 2));

                if (data.schema) {
                    Fetch('/serv/bolt/generate_golang_struct', {
                        schema: data.schema,
                    }, (genRes: Response) => {
                        if (genRes.status) {
                            setGolangCode(genRes.data.code);
                        }
                    });
                } else {
                    initDefaultGoStruct();
                }
            } else {
                if (res.msg && res.msg.toLowerCase().includes('bucket not found')) {
                    setMetadata({});
                    setJsonStr(JSON.stringify({}, null, 2));
                    initDefaultGoStruct();
                } else {
                    alt.current?.show('获取元数据失败：' + res.msg);
                }
            }
        });
    }

    function initDefaultGoStruct() {
        const cleanTableName = props.table.split('|').pop() || 'Record';
        setGolangCode(
`type ${cleanTableName} struct {
    ID   int    \`storm:"id,increment" json:"id"\`
    Name string \`storm:"index" json:"name"\`
}`
        );
    }

    function saveMetadata(customJson?: string) {
        const targetJson = customJson !== undefined ? customJson : jsonStr;
        let obj: any;
        try {
            obj = JSON.parse(targetJson);
        } catch (e) {
            modal.current?.close(); // 确保遮罩层关闭
            modal.current?.alert('错误的 JSON 格式: ' + e);
            return;
        }

        modal.current?.loading('保存元数据中...');
        Fetch('/serv/bolt/save_metadata', {
            db: props.db,
            table: props.table,
            metadata: obj,
        }, (res: Response) => {
            modal.current?.close();
            if (res.status) {
                setMetadata(obj);
                setJsonStr(JSON.stringify(obj, null, 2));
                alt.current?.show('保存元数据成功');
            } else {
                modal.current?.alert('保存元数据失败：' + res.msg);
            }
        });
    }

    function handleTabChange(nextTab: 'json' | 'golang') {
        if (activeTab === nextTab) return;

        if (nextTab === 'json') {
            // 从 Go 结构体代码自动同步回元数据 JSON
            if (!golangCode.trim()) {
                setActiveTab('json');
                return;
            }
            modal.current?.loading('正在从 Go 结构体同步 Schema...');
            Fetch('/serv/bolt/parse_golang_struct', {
                code: golangCode,
            }, (res: Response) => {
                modal.current?.close();
                if (res.status) {
                    const updatedMeta = { ...metadata, schema: res.data };
                    setMetadata(updatedMeta);
                    setJsonStr(JSON.stringify(updatedMeta, null, 2));
                    setActiveTab('json');
                } else {
                    modal.current?.alert('同步失败，请检查结构体代码：' + res.msg);
                }
            });
        } else if (nextTab === 'golang') {
            // 从当前 JSON 元数据同步生成 Go 代码
            let obj: any;
            try {
                obj = JSON.parse(jsonStr);
            } catch (e) {
                modal.current?.alert('JSON 格式错误，请先修正后再切换页签: ' + e);
                return;
            }

            if (!obj.schema) {
                setActiveTab('golang');
                return;
            }

            modal.current?.loading('正在根据当前 Schema 生成 Go 结构体...');
            Fetch('/serv/bolt/generate_golang_struct', {
                schema: obj.schema,
            }, (res: Response) => {
                modal.current?.close();
                if (res.status) {
                    setGolangCode(res.data.code);
                    setActiveTab('golang');
                } else {
                    modal.current?.alert('反向生成 Go 代码失败：' + res.msg);
                }
            });
        }
    }

    function saveAll() {
        if (activeTab === 'json') {
            saveMetadata(jsonStr);
        } else {
            // 当前在 Go 代码 Tab 时，直接保存会先解析代码生成 schema，再合并保存
            if (!golangCode.trim()) {
                modal.current?.alert('请输入 Go 结构体代码');
                return;
            }
            modal.current?.loading('正在解析 Go 代码并保存元数据...');
            Fetch('/serv/bolt/parse_golang_struct', {
                code: golangCode,
            }, (res: Response) => {
                if (res.status) {
                    const updatedMeta = { ...metadata, schema: res.data };
                    setMetadata(updatedMeta);
                    saveMetadata(JSON.stringify(updatedMeta));
                } else {
                    modal.current?.close();
                    modal.current?.alert('解析结构体失败，保存终止：' + res.msg);
                }
            });
        }
    }

    return (
        <div className="d-flex flex-column" style={{ height: '550px' }}>
            <Alerts ref={alt} theme={Theme.light} />
            
            <div className="d-flex align-items-center mb-3">
                <ul className="nav nav-tabs flex-grow-1 m-0">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'json' ? 'active' : ''}`}
                            onClick={() => handleTabChange('json')}
                        >
                            编辑元数据 (JSON)
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'golang' ? 'active' : ''}`}
                            onClick={() => handleTabChange('golang')}
                        >
                            编辑 Go 结构体 (自动同步)
                        </button>
                    </li>
                </ul>
                <div className="ms-2">
                    <Button size="sm" icon="save" theme={Theme.success} onClick={saveAll}>
                        保存当前元数据
                    </Button>
                </div>
            </div>

            <div className="flex-grow-1 overflow-hidden position-relative mb-2">
                {activeTab === 'json' ? (
                    <div className="h-100 border">
                        <AceEditor
                            mode="json"
                            theme="github_dark"
                            name="meta_json_edit"
                            wrapEnabled={true}
                            value={jsonStr}
                            width="100%"
                            height="100%"
                            onChange={(val) => setJsonStr(val)}
                            setOptions={{
                                showLineNumbers: true,
                                tabSize: 2,
                                fontSize: 14,
                                showPrintMargin: false,
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-100 border">
                        <AceEditor
                            mode="golang"
                            theme="github_dark"
                            name="meta_go_edit"
                            wrapEnabled={true}
                            value={golangCode}
                            width="100%"
                            height="100%"
                            onChange={(val) => setGolangCode(val)}
                            setOptions={{
                                showLineNumbers: true,
                                tabSize: 4,
                                fontSize: 14,
                                showPrintMargin: false,
                            }}
                        />
                    </div>
                )}
            </div>
            <Modal ref={modal} />
        </div>
    );
}
