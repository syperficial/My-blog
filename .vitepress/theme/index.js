import DefaultTheme from 'vitepress/theme'
import './index.css'

export default {
  ...DefaultTheme,
  themeConfig: {
    // 保留左侧导航栏，所以不要设置 sidebar 为 false
    outline: false, // 关闭右侧页面大纲
    backToTop: {
      text: '↑',
      visibilityHeight: 300
    }
  }
}   
