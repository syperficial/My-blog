# 商城项目

#### 接口文档

https://www.apifox.cn/apidoc/shared/c05cb8d7-e591-4d9c-aff8-11065a0ec1de/api-67132163

## 项目亮点

​	1.长页面吸顶交互实现

​	2.图片懒加载指令封装

​	3.面板插槽组件等业务通用组件封装

​	4.SKU电商组件封装

​	5.通用逻辑函数封装

​	6.路由缓存问题处理

​	7.第三方支付功能



## 项目文件夹解释

​	apis  ---> API接口文件夹

​	assets --->  静态资源文件夹

​	components --->   公共组件文件夹

​	composables ---> 组合函数文件夹

​	directives ---> 全局指令文件夹

​	router ---> 路由文件夹

​	stores ---> 仓库文件夹

​	style ---> 全局样式文件夹

​	utils ---> 工具函数文件夹

​	views ---> 页面文件夹



## 项目起步

### 	创建项目

```shell
npm create vue@latest
```

本项目中路由使用的是全局加载

### 	使用git管理项目

​	 基于create-vue创建出来的项目默认没有初始化git仓库需要手动初始化

1.执行git命令完成首次提交

```shell
git init # 初始化本地仓库
git add . # 提交到缓存区
git commit -m 'init' # 提交到本地仓库 并附上提交说明
git branch -M main # 设置主分支为main
git checkout -b dev # -b表示新建分支并切换过去 dev新的分支名
git remote add origin https:.... # 绑定提交仓库地址
git push -u origin main # 推送到创建仓库分支
git status # 查看当前分支
git branch -a # 查看所有分支（本地+远程）
----------------
# 第一次配置需配置身份信息
git config --global user.name '用户名'
git config --global user.email '邮箱或令牌'
```



## 安装sass与配置

```shell
pnpm add sass -D
```

```javascript
// 配置vite.config.js 
  plugins: [
    vue(),
    vueDevTools(),
        AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
        Components({
      resolvers: [ElementPlusResolver({importStyle:'sacc'})],
    }),
  ],
    
    
// 自动导入定制化样式文件进行样式覆盖
  CSS:{
    preprocessorOptions:{
      scss:{
        additionalData:`@import "@/styles/element/index.scss" as * ;`},
  }},
```



## 安装axios和配置基地值

```shell
# 安装axios
pnpm add axios
```

```javascript
// axios基础封装
import axios from "axios";
const httpIsntance =  axios.create({
    // 基地址
    baseURL: "http://pcapi-xiaotuxian-front-devtest.itheima.net",
    // 超时时间
    timeout: 5000,
})

// axios请求拦截器
httpIsntance.interceptors.request.use(config => {
  return config
}, e => Promise.reject(e))

// axios响应式拦截器
httpIsntance.interceptors.response.use(res => res.data, e => {
  return Promise.reject(e)
})
// 导出
export default httpIsntance
```



## 商品详情

面包屑导航

#### 报错问题：

```javascript
// 数据没有返回之前是数据空对象 undefined 
// 这里有两个解决方法
// 使用可选链的方 ？. 和 v-if判断 没有数据不渲染 在有数据时才渲染面包屑导航

// 第一种方法 可选链
<el-breadcrumb-item :to="{ path: `/category/${goods.categories?.[1].id}` }">
    {{ goods.categories?.[1].name }}
</el-breadcrumb-item>
//第二种方法 v-if
<el-breadcrumb-item v-if="goods.categories && goods.categories.length > 0"
                        :to="{ path`/category/sun${goods.categories[0].id}` }">
    {{ goods.categories[0].name }}
</el-breadcrumb-item>

```





#### 难点：

热榜效果：

```javascript
// 这是封装好的接口
// 需要携带三个参数 limit 条数
// type 关键 1代表二十四小时 2代表周销热榜 3代表总销热榜 
// 需要拿 type 去适配 title 标题
export function getHotGoods({ id, type, limit = 10 }) {
    return httpIsntance.get('/goods/hot', {
        params: {
            id,
            type,
            limit
        }
    });
}

```

```javascript
// 第一步 使用props去适配不同的title和数据
const props = defineProps({
    hotType: {
        type: Number,
        default: 1
    }
})

// 第二步 适配title
const TYPEMAP = {
    1: '24小时热销榜',
    2: '周热销榜',
    3: '总热销榜'
}
// 第三步 使用计算函数进行匹配
const title = computed(() => TYPEMAP[props.hotType])
// 第四步 传输函数时 type写成 type:props.hotType
    const res = await getHotGoods({
        id: route.params.id,
        type: props.hotType
    })
    
// 在展示页面传入 需要展示的type组件
<DetailsHot :hotType="1" /> <!-- 二十四热榜组件 -->
<DetailsHot :hotType="2" /> <!-- 周热榜组件 -->
<DetailsHot :hotType="3" /> <!-- 总周热榜组件 -->
```

# 图片放大镜效果：

1.使用 @mouseenter 当鼠标悬停在某张图片上触发

```javascript
// 实现鼠标移入 移除交互
const activeIndex = ref(0)

const enterhandler = (i) => {
    activeIndex.value = i // 记录下标值

}

```

2.获取鼠标相对位置 使用 useMouseInElement

useMouseInElement（elementX, elementY, isOutside ）

纵向 横向 isOutside:判断鼠标移动是在外部还是内部

3.使用watch进行监听鼠标移动的位置

```javascript
// 这是模板化代码 在任何图片放大 都可以适配
watch([elementX, elementY, isOutside], () => {
    // 如果鼠标没有一道移入到盒子里面 执行
    if (isOutside.value) return
    // 有效范围内 控制滑块的距离
    // 横向
    if (elementX.value > 100 && elementX.value < 300) {
        left.value = elementX.value - 100 // 200px的滑块
    }
    // 纵向
    if (elementY.value > 100 && elementY.value < 300) {
        top.value = elementY.value - 100 // 200px的滑块
    }

    // 边界
    if (elementX.value > 300) { left.value = 200 }
    if (elementX.value < 100) { left.value = 0 }

    if (elementY.value > 300) { top.value = 200 }
    if (elementY.value < 100) { top.value = 0 }
  
  	    // 控制大图的显示隐藏
    positionX.value = -left.value * 2
    positionY.value = -top.value * 2
})
```

4.使用props进行图片适配

```javascript
// props 适配图片列表
defineProps({
    imageList: {
        type: Array,
        default: () => []
    }
})

// 在 父组件 主页面 携带数据 给子组件
// 数据
const res = await getGoodsDetail(route.params.id)
goods.value = res.result
<!-- 图片预览区 -->
<ImageView :imageList="goods.mainPictures" />
  

```

# 接口返回慢解决方案

优化：页面秒开 数据渐进更新

先展示旧数据 在拉取新数据更新 

缓存 + 异步刷新

```javascript
// 本地缓存 + 异步刷新 解决慢接口问题
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLikeStore = defineStore('like', () => {
  const likeList = ref([]) // 旧数据

  const setLikeList = (list) =>{
    likeList.value = list
  }

  return {
    likeList,
    setLikeList
  }
},{
  persist: true
})
```

```javascript
// 优化慢接口
const orderList = ref([])

// 初始化 优先展示旧数据
orderList.value = likeStore.likeList
// 正常异步拉取数据 失败也不影响页面展示
const getOrderList = async() => {
  const res = await GetMyOrder(params.value)

  orderList.value = res.result.items
  // 最新数据存储
  likeStore.setLikeList(orderList.value)
}

getOrderList()
```



tab切换，当封装存储数据 进行tab切换时 会存在数据污染 其他tab页面下 会渲染旧数据

```javascript
/ 初始化 根据当前的orderList拉取旧数据
const loadCache = ()=>{
  orderList.value = likeStore.getLikeList(params.value.orderState)
}

// 正常异步拉取数据 失败也不影响页面展示
const getOrderList = async() => {
  loadCache()
  const res = await GetMyOrder(params.value)

  orderList.value = res.result.items
  // 最新数据存储
  likeStore.setLikeList(params.value.orderState,res.result.items)
}

loadCache()
getOrderList()

// tab切换
const tabChange = (type) => {
  // console.log(type)
  params.value.orderState = type
  loadCache() // 切换先用旧数据
  getOrderList() // 后台拉取新数据
}
```

```javascript
// 本地缓存 + 异步刷新 解决慢接口问题
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLikeStore = defineStore('like', () => {
  const likeList = ref({}) // 旧数据

  const setLikeList = (key,list) =>{
    likeList.value[key] = list // 根据键名进行更新
  }
  const getLikeList = (key) =>{
    return likeList.value[key] || []
  }

  const clearerLikeList = () =>{
    likeList.value = {}
  }

  return {
    likeList,
    setLikeList,
    getLikeList,
    clearerLikeList
  }
},{
  persist: true
})

```


