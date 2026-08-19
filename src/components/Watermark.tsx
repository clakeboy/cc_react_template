import { useEffect, useState } from 'react';
import { t } from 'i18next';
interface Props {
    user?: any
    systemName?: string
}

// 全局水印组件：显示系统名称与当前登录用户
export default function Watermark({ user, systemName = 'pcbx_chancel' }: Props): any {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        setUserName(user && user.name ? user.name : '');
    }, [user]);

    function encodeXml(str: string) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function buildImage() {
        const line2 = userName ? '当前用户：' + userName : '';
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
            + '<text x="50%" y="45%" text-anchor="middle" fill="rgba(0,0,0,0.08)" font-size="18" font-family="sans-serif" transform="rotate(-30, 150, 100)">' + encodeXml(t('system_name')) + '</text>'
            + '<text x="50%" y="58%" text-anchor="middle" fill="rgba(0,0,0,0.08)" font-size="14" font-family="sans-serif" transform="rotate(-30, 150, 100)">' + encodeXml(line2) + '</text>'
            + '</svg>';
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    }

    return (
        <div className="watermark-mask" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 999999,
            backgroundRepeat: 'repeat',
            backgroundImage: buildImage(),
        }} />
    );
}