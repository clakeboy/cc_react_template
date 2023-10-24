import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import './style.css'
import Fetch from "../../common/Fetch";
import { t } from 'i18next';
import { GetLang } from "../../common/Funcs";
interface Props {
    value: boolean
    width: string
    height: string
    calcPosType: 'dom' | 'screen'
    maxDot: number
    imageBase64: string
    thumbBase64: string
    close?: { (): void }
    confirm?: { (dot: Dot[], captKey: string): void }
}

interface State {
    imageBase64Code: string
    thumbBase64Code: string
    dots: Dot[]
    captKey: string
}

export interface Dot {
    x: number
    y: number
    index: number
}

export class GoCaptcha extends Component<Props, State> {
    static defaultProps = {
        value: PropTypes.bool.isRequired,
        width: '300px',
        height: '240px',
        calcPosType: PropTypes.oneOf(['dom', 'screen']),
        maxDot: 5,
        imageBase64: PropTypes.string,
        thumbBase64: PropTypes.string
    }

    constructor(props: any) {
        super(props);
        this.state = {
            imageBase64Code: '',
            thumbBase64Code: '',
            dots: [],
            captKey: '',
        }
    }

    componentDidMount() {
        this.handleRequestCaptCode()
    }

    handleRequestCaptCode = () => {
        let lng = GetLang()
        Fetch('/serv/login/get_captcha_data', {lng}, (res) => {
            const { data = {} } = res;
            if ((data['code'] || 0) === 0) {
                if (!data) {
                    return
                }
                this.setState({
                    imageBase64Code: data['image_base64'] || '',
                    thumbBase64Code: data['thumb_base64'] || '',
                    captKey: data['captcha_key'] || '',
                    dots: [],
                })
            } else {
                // this.modal.alert(`获取人机验证数据失败`);
            }
        })
    }

    render() {
        const {
            width = '',
            height = '',
        } = this.props

        const {
            imageBase64Code,
            thumbBase64Code
        } = this.state

        const RenderDotItem = () => {
            const { dots = [] } = this.state
            return <>
                {dots.map((dot) => (
                    <div className="wg-cap-wrap__dot" style={{ top: `${dot.y}px`, left: `${dot.x}px` }}>
                        <span>{dot.index}</span>
                    </div>
                ))}
            </>
        }

        return (<Fragment>
            <div className="wg-cap-wrap">
                <div className="wg-cap-wrap__header">
                    <span>{t('captcha.pls')}<em>{t('captcha.in_ord')}</em></span>
                    {
                        thumbBase64Code ? <img className="wg-cap-wrap__thumb" src={thumbBase64Code} alt=" " /> : <div>图片加载失败</div>
                    }
                </div>
                <div className="wg-cap-wrap__body" style={{
                    width: width,
                    height: height
                }}>
                    {
                        imageBase64Code && <img className="wg-cap-wrap__picture"
                            src={imageBase64Code} alt=" "
                            onClick={this.handleClickPos} />
                    }
                    <img className="wg-cap-wrap__loading"
                        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiByZ2JhKDI0MSwgMjQyLCAyNDMsIDApOyBkaXNwbGF5OiBibG9jazsgc2hhcGUtcmVuZGVyaW5nOiBhdXRvOyIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjM2LjgxMDEiIHI9IjEzIiBmaWxsPSIjM2U3Y2ZmIj4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgY2FsY01vZGU9InNwbGluZSIga2V5U3BsaW5lcz0iMC40NSAwIDAuOSAwLjU1OzAgMC40NSAwLjU1IDAuOSIga2V5VGltZXM9IjA7MC41OzEiIHZhbHVlcz0iMjM7Nzc7MjMiPjwvYW5pbWF0ZT4KICA8L2NpcmNsZT4KPC9zdmc+"
                        alt="正在加载中..." />
                    <RenderDotItem />
                </div>
                <div className="wg-cap-wrap__footer">
                    <div className="wg-cap-wrap__ico">
                        <img onClick={this.handleCloseEvent}
                            src="data:image/svg+xml;base64,PHN2ZyB0PSIxNjI2NjE0NDM5NDIzIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijg2NzUiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNTEyIDIzLjI3MjcyN2MyNjkuOTE3MDkxIDAgNDg4LjcyNzI3MyAyMTguODEwMTgyIDQ4OC43MjcyNzMgNDg4LjcyNzI3M2E0ODYuNjMyNzI3IDQ4Ni42MzI3MjcgMCAwIDEtODQuOTQ1NDU1IDI3NS40MDk0NTUgNDYuNTQ1NDU1IDQ2LjU0NTQ1NSAwIDAgMS03Ni44NDY1NDUtNTIuNTI2NTQ2QTM5My41NDE4MTggMzkzLjU0MTgxOCAwIDAgMCA5MDcuNjM2MzY0IDUxMmMwLTIxOC41MDc2MzYtMTc3LjEyODcyNy0zOTUuNjM2MzY0LTM5NS42MzYzNjQtMzk1LjYzNjM2NFMxMTYuMzYzNjM2IDI5My40OTIzNjQgMTE2LjM2MzYzNiA1MTJzMTc3LjEyODcyNyAzOTUuNjM2MzY0IDM5NS42MzYzNjQgMzk1LjYzNjM2NGEzOTUuMTcwOTA5IDM5NS4xNzA5MDkgMCAwIDAgMTI1LjQ0LTIwLjI5MzgxOSA0Ni41NDU0NTUgNDYuNTQ1NDU1IDAgMCAxIDI5LjQ4NjU0NSA4OC4yOTY3MjhBNDg4LjI2MTgxOCA0ODguMjYxODE4IDAgMCAxIDUxMiAxMDAwLjcyNzI3M0MyNDIuMDgyOTA5IDEwMDAuNzI3MjczIDIzLjI3MjcyNyA3ODEuOTE3MDkxIDIzLjI3MjcyNyA1MTJTMjQyLjA4MjkwOSAyMy4yNzI3MjcgNTEyIDIzLjI3MjcyN3ogbS0xMTUuMiAzMDcuNzEyTDUxMiA0NDYuMTM4MTgybDExNS4yLTExNS4yYTQ2LjU0NTQ1NSA0Ni41NDU0NTUgMCAxIDEgNjUuODE1MjczIDY1Ljg2MTgxOEw1NzcuODYxODE4IDUxMmwxMTUuMiAxMTUuMmE0Ni41NDU0NTUgNDYuNTQ1NDU1IDAgMSAxLTY1Ljg2MTgxOCA2NS44MTUyNzNMNTEyIDU3Ny44NjE4MThsLTExNS4yIDExNS4yYTQ2LjU0NTQ1NSA0Ni41NDU0NTUgMCAxIDEtNjUuODE1MjczLTY1Ljg2MTgxOEw0NDYuMTM4MTgyIDUxMmwtMTE1LjItMTE1LjJhNDYuNTQ1NDU1IDQ2LjU0NTQ1NSAwIDEgMSA2NS44NjE4MTgtNjUuODE1MjczeiIgcC1pZD0iODY3NiIgZmlsbD0iIzcwNzA3MCI+PC9wYXRoPjwvc3ZnPg=="
                            alt="关闭" />
                        <img onClick={this.handleRefreshEvent}
                            src="data:image/svg+xml;base64,PHN2ZyB0PSIxNjI2NjE0NDk5NjM4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEzNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMTg3LjQ1NiA0MjUuMDI0YTMzNiAzMzYgMCAwIDAgMzY4LjM4NCA0MjAuMjI0IDQ4IDQ4IDAgMCAxIDEyLjU0NCA5NS4xNjggNDMyIDQzMiAwIDAgMS00NzMuNjY0LTU0MC4xNmwtNTcuMjgtMTUuMzZhMTIuOCAxMi44IDAgMCAxLTYuMjcyLTIwLjkyOGwxNTkuMTY4LTE3OS40NTZhMTIuOCAxMi44IDAgMCAxIDIyLjE0NCA1Ljg4OGw0OC4wNjQgMjM1LjA3MmExMi44IDEyLjggMCAwIDEtMTUuODA4IDE0LjkxMmwtNTcuMjgtMTUuMzZ6TTgzNi40OCA1OTkuMDRhMzM2IDMzNiAwIDAgMC0zNjguMzg0LTQyMC4yMjQgNDggNDggMCAxIDEtMTIuNTQ0LTk1LjE2OCA0MzIgNDMyIDAgMCAxIDQ3My42NjQgNTQwLjE2bDU3LjI4IDE1LjM2YTEyLjggMTIuOCAwIDAgMSA2LjI3MiAyMC45MjhsLTE1OS4xNjggMTc5LjQ1NmExMi44IDEyLjggMCAwIDEtMjIuMTQ0LTUuODg4bC00OC4wNjQtMjM1LjA3MmExMi44IDEyLjggMCAwIDEgMTUuODA4LTE0LjkxMmw1Ny4yOCAxNS4zNnoiIGZpbGw9IiM3MDcwNzAiIHAtaWQ9IjEzNjEiPjwvcGF0aD48L3N2Zz4="
                            alt="刷新" />
                    </div>
                    <div className="wg-cap-wrap__btn">
                        <button onClick={this.handleConfirmEvent}>{t('confirm')}</button>
                    </div>
                </div>
            </div>
        </Fragment>)
    }

    // // ===========
    componentWillReceiveProps(nextProps: any, nextContext: any) {
        if (!nextProps.value) {
            this.handleRequestCaptCode()
        }
    }
    // ================= Methods ================
    /**
     * @Description: 处理关闭事件
     */
    handleCloseEvent = () => {
        this.props.close && this.props.close()
        this.setState({
            dots: [],
            imageBase64Code: '',
            thumbBase64Code: ''
        });
    }

    /**
     * @Description: 处理刷新事件
     */
    handleRefreshEvent = () => {
        this.setState({
            dots: []
        });
        this.handleRequestCaptCode()
    }

    /**
     * @Description: 处理确认事件
     */
    handleConfirmEvent = () => {
        this.props.confirm && this.props.confirm(this.state.dots || [], this.state.captKey)
    }

    /**
     * @Description: 处理dot
     * @param ev
     */
    handleClickPos = (e: React.MouseEvent<HTMLImageElement>) => {
        const { dots = [] } = this.state
        const { maxDot } = this.props

        if (dots.length >= maxDot) {
            return
        }
        // const e = ev as MouseEvent
        e.preventDefault()
        const dom = e.currentTarget as HTMLElement

        const { domX, domY } = this.getDomXY(dom)
        // ===============================================
        // @notice 如 getDomXY 不准确可尝试使用 calcLocationLeft 或 calcLocationTop
        // const domX = this.calcLocationLeft(dom)
        // const domY = this.calcLocationTop(dom)
        // ===============================================

        let mouseX = e.pageX
        let mouseY = e.pageY
        if (this.props.calcPosType === 'screen') {
            mouseX = e.clientX
            mouseY = e.clientY
        }

        // 计算点击的相对位置
        const xPos = mouseX - domX
        const yPos = mouseY - domY

        // 转整形
        const xp = parseInt(xPos.toString())
        const yp = parseInt(yPos.toString())

        // 减去点的一半
        const newDots = [...dots, {
            x: xp - 11,
            y: yp - 11,
            index: dots.length + 1
        }]

        this.setState({
            dots: newDots
        });

        return false
    }
    /**
     * @Description: 找到元素的屏幕位置
     * @param el
     */
    calcLocationLeft = (el: HTMLElement) => {
        let tmp = el.offsetLeft
        let val = el.offsetParent as HTMLElement
        while (val != null) {
            tmp += val.offsetLeft
            val = val.offsetParent as HTMLElement
        }
        return tmp
    }
    /**
     * @Description: 找到元素的屏幕位置
     * @param el
     */
    calcLocationTop = (el: HTMLElement) => {
        let tmp = el.offsetTop
        let val = el.offsetParent as HTMLElement
        while (val != null) {
            tmp += val.offsetTop
            val = val.offsetParent as HTMLElement
        }
        return tmp
    }
    /**
     * @Description: 找到元素的屏幕位置
     * @param dom
     */
    getDomXY = (dom: HTMLElement) => {
        let x = 0
        let y = 0
        if (dom.getBoundingClientRect) {
            let box = dom.getBoundingClientRect();
            let D = document.documentElement;
            x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
            y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop
        }
        else {
            while (dom !== document.body) {
                x += dom.offsetLeft
                y += dom.offsetTop
                dom = dom.offsetParent as HTMLElement
            }
        }
        return {
            domX: x,
            domY: y
        }
    }

}