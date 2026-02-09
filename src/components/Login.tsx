/**
 * Created by clakeboy on 2018/6/29.
 */
import React from 'react';

import '../assets/css/Login.less';
import '../assets/css/theme-switch.less';
import '../assets/css/theme-selector.less';
import '../assets/css/themes.less';
import {
    Icon,
    Input,
    Button,
    CCheckbox,
    Modal,
    CKModal,
    Load,
    CDropdown
} from '@clake/react-bootstrap4';
import Fetch from "../common/Fetch";
import Storage from "../common/Storage";
import GoCaptchaBtn from "./GoCaptchaBtn";
import { GoCaptcha, Dot } from "./GoCaptcha";
import { t } from 'i18next';
import { GetLang } from '../common/Funcs';
import { UserData } from '../common/Common';
import { ThemeType, themes, getThemeList, setTheme, getCurrentTheme } from '../common/Theme';

interface State {
    page_data: {
        user_name: string
        password: string
        remember: boolean
        [propName: string]: any
    }
    init: boolean
    tab: boolean
    captStatus: string
    captAutoRefreshCount: number
    captKey: string
    theme: ThemeType
    lang: string
    showThemePanel: boolean
}

class Login extends React.Component<any, State> {
    user: UserData
    modal: CKModal
    themeBtnRef: React.RefObject<HTMLDivElement>
    constructor(props: any) {
        super(props);
        this.themeBtnRef = React.createRef();
        this.state = {
            page_data: {
                user_name: '',
                password: '',
                remember: false
            },
            init: false,
            tab: true,
            captStatus: 'default',
            captAutoRefreshCount: 0,
            captKey: '',
            theme: props.theme || getCurrentTheme(),
            lang: this.props.lang ?? GetLang(),
            showThemePanel: false
        };

        let login_name = Storage.get('login_name');
        if (login_name) {
            this.state.page_data.user_name = login_name;
            this.state.page_data.remember = true;
        }
    }

    componentDidMount() {
        document.title = t('login.title');
        this.checkLogin()
    }

    checkLogin() {
        Fetch('/serv/login/auth', {}, (res) => {
            if (res.status) {
                this.setLogin(res.data);
            } else {
                this.setState({
                    init: true
                })
            }
        }, (e) => {

        })
    }

    setLogin(user: any) {
        this.user = user;
        this.props.setLogin(true, user);
    }

    changeHandler(name: string) {
        return (val: any) => {
            let data = this.state.page_data;
            data[name] = val;
            this.setState({
                page_data: data
            })
        };
    }

    changeThemeHandler(theme: ThemeType) {
        if (typeof this.props.setTheme === 'function') {
            this.props.setTheme(theme)
        }
        setTheme(theme);
        this.setState({
            theme: theme,
            showThemePanel: false
        })
    }

    login = () => {
        if (this.state.page_data.remember) {
            Storage.set('login_name', this.state.page_data.user_name);
        } else {
            Storage.remove('login_name');
        }
        this.modal.loading('正在登录中...');
        Fetch('/serv/login/login', {
            username: this.state.page_data.user_name,
            password: this.state.page_data.password,
            capt_key: this.state.captKey
        }, (res) => {
            if (res.status) {
                this.modal.close();
                //设置权限节点
                this.setLogin(res.data);
            } else {
                this.modal.alert({
                    title: t('err'), content: t(`login.${res.msg}`), callback: () => {
                        this.setState({
                            captStatus: 'default',
                            captAutoRefreshCount: 0,
                            captKey: '',
                        })
                    }
                })
            }
        }, (e) => {
            this.modal.alert('远程调用错误! ' + e);
        })
    };

    render() {
        if (!this.state.init) {
            return this.renderLoad()
        }
        return this.renderLogin()
    }

    renderLoad() {
        return (
            <div className='text-center text-danger mt-5 mb-5'>
                <Load>{t('loading')}</Load>
            </div>
        )
    }

    showCaptCode = () => {
        this.modal?.view({
            header: false,
            width: '340px',
            content: <GoCaptcha
                value={false}
                width="300px"
                height="240px"
                maxDot={5}
                calcPosType="screen"
                close={this.handleClose}
                confirm={this.handleConfirm}
            />,
        });
    }

    handleClose = () => {
        this.modal?.close();
    }

    handleConfirm = (dots: Dot[], key: string) => {
        this.modal?.close();
        this.setState({
            captStatus: 'check',
            captKey: key,
        }, () => {
            let dotArr: number[] = []
            dots.forEach((dot) => {
                dotArr.push(dot.x, dot.y)
            })
            Fetch('/serv/login/check_captcha', {
                dots: dotArr.join(','),
                key: key || ''
            }, (res) => {
                if (res.status) {
                    const { data = {} } = res;
                    if ((data['code'] || 0) === 0) {
                        this.setState({
                            captStatus: 'success',
                            captAutoRefreshCount: 0
                        })
                    } else {
                        const { captAutoRefreshCount = 0 } = this.state
                        if (captAutoRefreshCount > 5) {
                            this.setState({
                                captStatus: 'overing',
                                captAutoRefreshCount: 0
                            })
                            return
                        }
                        this.setState({
                            captStatus: 'error',
                            captAutoRefreshCount: captAutoRefreshCount + 1
                        })
                    }
                }
            })
        })
    }

    renderLogin() {
        const { captStatus, theme } = this.state;
        const currentConfig = themes[theme];
        
        return (
            <div className='ck-login'>
                <div className="ck-login-window shadow">
                    <div className="login-header text-center">
                        <Icon icon='wallet' /> {t('system_name')}
                    </div>
                    <div className="login-body">
                        <Input className='mb-3' label={t('login.username')} placeholder={t('login.input_username')} data={this.state.page_data.user_name} onChange={this.changeHandler('user_name')} />
                        <Input className='mb-3' label={t('login.password')}  placeholder={t('login.input_password')} type='password' onEnter={this.login} data={this.state.page_data.password} onChange={this.changeHandler('password')} />
                        <GoCaptchaBtn
                            value={captStatus}
                            width="100%"
                            height="38px"
                            changeValue={(val) => this.setState({ captStatus: val })}
                            show={this.showCaptCode}
                        />
                        <CCheckbox label={t('login.remember_me')} className="mt-3" onChange={(check: boolean) => {
                            let data = this.state.page_data;
                            data.remember = check;
                            this.setState({
                                page_data: data
                            })
                        }} checked={this.state.page_data.remember} />
                        <Button className="mt-3" block onClick={this.login} >{t('login.sign_in')}</Button>
                    </div>
                </div>
                <Modal ref={(c:any) => this.modal = c} />
                {this.renderLanguages()}
            </div>
        );
    }

    renderLanguages() {
        const { theme, showThemePanel } = this.state;
        const currentConfig = themes[theme];

        return (
            <div className='language comm-form'>
                <Icon className="icon" icon="language"/> 
                <CDropdown className="mr-2" text="" width="100px" size="sm" onChange={(val:string,row:{text:string,value:string})=>{
                    this.setState({
                        lang:row?row.value:GetLang()
                    },()=>{
                        this.props.changeLang(this.state.lang);
                    })
                }}>
                    <CDropdown.Value value="zh" text="中文" active={this.state.lang === 'zh'}/>
                    <CDropdown.Value value="en" text="English" active={this.state.lang === 'en'}/>
                </CDropdown>
                
                {/* 主题选择器 */}
                <div 
                    ref={this.themeBtnRef}
                    className="login-theme-selector"
                    onClick={() => this.setState({ showThemePanel: !showThemePanel })}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        backgroundColor: currentConfig.color + '20',
                        border: `1px solid ${currentConfig.color}40`,
                        cursor: 'pointer',
                        marginLeft: '8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Icon icon={currentConfig.icon} style={{ color: currentConfig.color, fontSize: '0.875rem' }} />
                    <span style={{ fontSize: '0.75rem', color: currentConfig.color, fontWeight: 500 }}>
                        {currentConfig.name}
                    </span>
                    <Icon icon="caret-down" style={{ fontSize: '0.625rem', color: currentConfig.color }} />
                </div>

                {/* 主题下拉面板 */}
                {showThemePanel && (
                    <div 
                        className="login-theme-panel"
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '10px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            padding: '8px',
                            minWidth: '160px',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ 
                            padding: '6px 10px', 
                            fontWeight: 600, 
                            fontSize: '0.75rem',
                            color: '#666',
                            borderBottom: '1px solid #eee',
                            marginBottom: '6px'
                        }}>
                            <Icon icon="palette" style={{ marginRight: '6px' }} />
                            选择主题
                        </div>
                        {getThemeList().map(({ key, config }) => (
                            <div
                                key={key}
                                onClick={() => this.changeThemeHandler(key)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: theme === key ? config.color + '15' : 'transparent',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (theme !== key) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (theme !== key) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: config.color + '20',
                                    border: theme === key ? `2px solid ${config.color}` : '2px solid transparent'
                                }}>
                                    <Icon icon={config.icon} style={{ color: config.color, fontSize: '0.75rem' }} />
                                </div>
                                <span style={{ 
                                    fontSize: '0.8125rem', 
                                    color: theme === key ? config.color : '#333',
                                    fontWeight: theme === key ? 600 : 400,
                                    flex: 1
                                }}>
                                    {config.name}
                                </span>
                                {theme === key && (
                                    <Icon icon="check" style={{ color: config.color, fontSize: '0.75rem' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }
}

export default Login;
