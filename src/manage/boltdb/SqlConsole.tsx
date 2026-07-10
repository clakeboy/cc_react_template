import { Button, CKModal, Modal, Theme } from '@clake/react-bootstrap4';
import { useEffect, useMemo, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/ext-language_tools';
import Fetch from '../../common/Fetch';
import { Response } from '../../common/Common';

interface Header {
    name: string
    type: string
}

interface Props {
    db: string
    from: string
    table: string
    fields?: Header[]
    tables?: string[]
    page?: number
    number?: number
    onResult?: (rows: any[], headers: Header[], count: number, page: number) => void
    onExecuted?: () => void
}

const SQL_KEYWORDS = [
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE',
    'AND',
    'OR',
    'NOT',
    'IN',
    'IS',
    'NULL',
    'LIKE',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'ASC',
    'DESC',
    'COUNT',
];

function defaultSQL(table: string): string {
    const parts = table.split('|');
    const tableName = parts.length >= 2 ? parts[1] : '';
    return tableName ? `SELECT * FROM ${tableName}` : 'SELECT * FROM TableName';
}

function isWriteSQL(sql: string): boolean {
    const text = sql.trim().toLowerCase();
    return text.startsWith('insert') || text.startsWith('update') || text.startsWith('delete');
}

function headersFromRows(rows: any[]): Header[] {
    const names: string[] = [];
    rows.forEach((row) => {
        Object.keys(row || {}).forEach((name) => {
            if (!names.includes(name)) {
                names.push(name);
            }
        });
    });
    names.sort();
    return names.map((name) => ({ name, type: '' }));
}

// SqlConsole 负责把 SQL 文本和 JSON 参数数组提交给后端 storm-rev SQL 执行器。
export default function SqlConsole({ db, from, table, fields = [], tables = [], page, number, onResult, onExecuted }: Props) {
    const [sql, setSQL] = useState(defaultSQL(table));
    const [argsText, setArgsText] = useState('[]');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const modal = useRef<CKModal>(null);
    const editorRef = useRef<any>(null);

    const lastExecutedSQL = useRef<string>('');
    const lastExecutedArgs = useRef<any[]>([]);

    useEffect(() => {
        setSQL(defaultSQL(table));
        lastExecutedSQL.current = '';
    }, [table]);

    const completions = useMemo(() => {
        const names: string[] = [];
        fields.forEach((item) => {
            if (item.name && !names.includes(item.name)) {
                names.push(item.name);
            }
        });
        const fieldItems = names.sort().map((name) => ({
            caption: name,
            value: name,
            meta: '当前表字段',
            score: 1000,
        }));
        const tableItems = [...tables].sort().map((name) => ({
            caption: name,
            value: name,
            meta: '表名',
            score: 900,
        }));
        const keywordItems = SQL_KEYWORDS.map((name) => ({
            caption: name,
            value: name,
            meta: 'SQL关键字',
            score: 500,
        }));
        return [...fieldItems, ...tableItems, ...keywordItems];
    }, [fields, tables]);

    useEffect(() => {
        if (editorRef.current) {
            setEditorCompleter(editorRef.current);
        }
    }, [completions]);

    const currentFrom = useMemo(() => {
        if (from) {
            return from;
        }
        const parts = table.split('|');
        return parts.length >= 2 ? parts[0] : '';
    }, [from, table]);

    useEffect(() => {
        if (!lastExecutedSQL.current) {
            return;
        }
        const activeNumber = number || 50;
        setLoading(true);
        Fetch('/serv/bolt/sql_exec', {
            db,
            from: currentFrom,
            sql: lastExecutedSQL.current,
            args: lastExecutedArgs.current,
            page,
            number: activeNumber,
        }, (res: Response) => {
            setLoading(false);
            if (!res.status) {
                modal.current?.alert('SQL 执行出错：' + res.msg);
                return;
            }
            const data = res.data || {};
            if (data.kind === 'exec') {
                setMessage(`影响行数: ${data.rows_affected || 0}`);
                onExecuted && onExecuted();
                return;
            }
            const list = data.list || [];
            const resultHeaders = (data.header && data.header.length > 0) ? data.header : headersFromRows(list);
            const resultCount = data.count || list.length;
            setMessage(`返回记录: ${resultCount}`);
            onResult && onResult(list, resultHeaders, resultCount, page || 1);
        });
    }, [page]);

    function setEditorCompleter(editor: any) {
        editor.completers = [{
            getCompletions: (_editor: any, _session: any, _pos: any, _prefix: string, callback: any) => {
                callback(null, completions);
            },
        }];
    }

    function editorLoad(editor: any) {
        editorRef.current = editor;
        setEditorCompleter(editor);
    }

    function parseArgs(): any[] | null {
        try {
            const args = argsText.trim() === '' ? [] : JSON.parse(argsText);
            if (!Array.isArray(args)) {
                modal.current?.alert('SQL 参数必须是 JSON 数组');
                return null;
            }
            return args;
        } catch (e) {
            modal.current?.alert('SQL 参数 JSON 格式错误: ' + e);
            return null;
        }
    }

    function submitSQL() {
        const args = parseArgs();
        if (!args) {
            return;
        }
        const activeNumber = number || 50;
        const run = () => {
            setLoading(true);
            Fetch('/serv/bolt/sql_exec', {
                db,
                from: currentFrom,
                sql,
                args,
                page: 1,
                number: activeNumber,
            }, (res: Response) => {
                setLoading(false);
                if (!res.status) {
                    modal.current?.alert('SQL 执行出错：' + res.msg);
                    return;
                }
                lastExecutedSQL.current = sql;
                lastExecutedArgs.current = args;

                const data = res.data || {};
                if (data.kind === 'exec') {
                    setMessage(`影响行数: ${data.rows_affected || 0}`);
                    onExecuted && onExecuted();
                    return;
                }
                const list = data.list || [];
                const resultHeaders = (data.header && data.header.length > 0) ? data.header : headersFromRows(list);
                const resultCount = data.count || list.length;
                setMessage(`返回记录: ${resultCount}`);
                onResult && onResult(list, resultHeaders, resultCount, 1);
            });
        };
        if (isWriteSQL(sql)) {
            modal.current?.confirm({
                title: '确认执行写入 SQL',
                content: 'INSERT/UPDATE/DELETE 会修改当前数据库，确定继续吗？',
            }, (flag) => {
                if (flag) {
                    run();
                }
            });
            return;
        }
        run();
    }

    return <div className="bolt-sql-console">
        <div className="comm-form mb-2">
            <span>DB: {db}</span>
            <span>From: {currentFrom || '-'}</span>
            <Button size="sm" icon="play" theme={Theme.primary} loading={loading} disabled={loading} onClick={submitSQL}>执行</Button>
            <span className="text-muted">{message}</span>
        </div>
        <AceEditor
            className="bolt-sql-editor"
            mode="sql"
            theme="github_dark"
            name="bolt_sql_editor"
            value={sql}
            width="100%"
            height="150px"
            onChange={(val) => setSQL(val)}
            onLoad={editorLoad}
            editorProps={{$blockScrolling:true}}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
                fontSize: 14,
                showPrintMargin: false,
            }}
        />
        <Modal ref={modal} center fade/>
    </div>;
}
