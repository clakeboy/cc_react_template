import i18n from 'i18next';
import {GetLang} from '../common/Funcs'
import en from './lang/en.json';
import zh from './lang/zh.json';

i18n
  // 检测用户当前使用的语言
  // 文档: https://github.com/i18next/i18next-browser-languageDetector
  // .use(LanguageDetector)
  // 注入 react-i18next 实例
  // .use(initReactI18next)
  // 初始化 i18next
  // 配置参数的文档: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    lng:GetLang(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en:{
        "ns1":en
      },
      zh:{
        "ns1":zh
      }
    },
    defaultNS:"ns1"
  });

export default i18n;