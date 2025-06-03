export default [
  { text: "首页", link: "/" },
  {
    text: "项目笔记",
    items: [
      { text: "电商项目", link: "/项目笔记/电商项目", },
      { text: "└ SKU规格拆解", link: "/项目笔记/电商项目/SKU" },


    ],
    activeMatch: "/项目介绍/*",
  },
  // 外部链接
  { text: "外部链接", link: "https://www.baidu.com" }

]
