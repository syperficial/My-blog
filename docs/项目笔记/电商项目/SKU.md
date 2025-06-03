### SKU 拆解详情

思路：

用户点击规格项 判断状态是否为禁用 在排中只能选择一个规则 更新 更新禁用规则

判断值的完整性 如果不完整则弹出提示 

禁用状态的初始化 和更新

​	遍历所有规格值 是否存在pathMap中 来进行管理当前禁用状态

​	对没排规格，遍历判断 将当前值临时替换选中数组中新的key 判断是否存在pathMap中 决定是否禁用

遍历商品的所有规格值和名称 组成kye和判断的完整度

使用子集算法将所得到的路径 转换为 路径字典 判断完整的路径字典是否有库存

获取商品接口

```javascript
import { onMounted, ref } from 'vue'
import axios from 'axios'
import powerSet from './power-set'
// 商品数据
const goods = ref({})
let pathMap = {}
const getGoods = async () => {
  // 1135076  初始化就有无库存的规格
  // 1369155859933827074 更新之后有无库存项（蓝色-20cm-中国）
  const res = await axios.get('http://pcapi-xiaotuxian-front-devtest.itheima.net/goods?id=1369155859933827074')
  goods.value = res.data.result // 赋值响应式数据 更新视图
  pathMap = getPathMap(goods.value) // 更具商品数据生成路径字典对象
  console.log(pathMap);
  // 初始化规格 状态为0 则为禁用状态
  initDisabledStatus(goods.value.specs, pathMap)

}
onMounted(() => getGoods())
```

##### 1.切换选中功能

​	拆解：切换时需要确定同一排对象和当前点击对象 判断当前的激活状态 进行类名赋值

​	需要再切换时 产出完整的sku对象 可以返回到后端去

```javascript
// 切换选中
const changeSelectedStatus = (item, val) => {
  if (val.disabled) return // 当是禁用项 不可点击
  //   item :同一排对象
  //   val： 当前点击对象
  // 一排内容中 只能选择一个进行激活
  if (val.selected) {
    // 已选中则取消选中
    val.selected = false
  } else {
    // 先清除当前排的选中状态
    item.values.forEach(val => val.selected = false)
    val.selected = true // 当前选中项
  }
  // 点击按钮时更新
  updateDisabledStatus(goods.value.specs, pathMap)
  // 产出SKU对象数据
  const index = getSelectedValues(goods.value.specs).findIndex(item => item === undefined)
  if (index > -1) {
    // 可以优化 弹框显示
    console.log('找到了信息不完整');

  } else {
    console.log('没有找到信息完整');
    // 获取sku对象
    const key = getSelectedValues(goods.value.specs).join('_')
    const skuIds = pathMap[key] // 获取sku id 列表
    console.log(skuIds);
    // 以skuIds中的第一个id去获取sku对象取出第一个
    const skuObj = goods.value.skus.find(item => item.id === skuIds[0])
    console.log(skuObj, '111');

  }
}
```



##### 2.生成路径字典对象

拆解：

​	根据有效的skus字典组成有效的sku数组 过滤出大于0

​	使用子集算法

​	将遍历的所有子集 存入到路径字典中 值是sku id 数组

```javascript
// 生成有效路径字典对象
const getPathMap = (goods) => {
  const patMap = {}
  // 1.根据有效skus字典生成有效的sku数组 过滤库存大于0的
  const effectiveSkus = goods.skus.filter(sku => sku.inventory > 0)

  // 2.根据有效的sku使用算法 （子集算法） [1,2] => [[1],[2],[1,2]]
  effectiveSkus.forEach(sku => {
    //  获取匹配的 valueName组成的数据
    const selectedValArr = sku.specs.map(val => val.valueName)
    // 使用算法获取子集 遍历所有的子集 key存入路径字典中 值是sku id数组
    const valueArrPowerSet = powerSet(selectedValArr)
    // 把得到的子集生成最终的路径字典对象
    valueArrPowerSet.forEach(arr => {
      // 初始化key 数组 join -> 字符串 对象的key
      const key = arr.join('_')
      // 如果已经存在当前的key了 就往数组中直接添加key 直接做赋值
      if (patMap[key]) {
        patMap[key].push(sku.id)
      } else {
        patMap[key] = [sku.id]
      }
    })
  })
  return patMap
}
```



##### 3.初始化禁用状态

拆解：

​	判断该路径字典是否存在改规格的值

```javascript
// 初始化禁用状态
const initDisabledStatus = (specs, pathMap) => {
  specs.forEach(spec => {
    spec.values.forEach(val => {
      if (pathMap[val.name]) { // 路径字典中存在该规格的值
        val.disabled = false
      } else {
        val.disabled = true
      }
    })
  })
}
```



##### 4.获取选中匹配的数组

```javascript
const getSelectedValues = (specs) => {
  const arr = []
  specs.forEach(spec => {
    // 目标：找到当前被选中的规格值
    const selectedVal = spec.values.find(item => item.selected)
    arr.push(selectedVal ? selectedVal.name : undefined)
  })
  return arr
}
```



##### 5.切换时更新禁用状态

拆解：

​	临时值替换当前规格值 判断是否为 可选状态

```javascript
// 切换时更新禁用状态
const updateDisabledStatus = (specs, pathMap) => {
  specs.forEach((spec, index) => {
    const selectedValues = getSelectedValues(specs)
    spec.values.forEach(val => {
      // 临时替换当前规格值 判断是否为 可选状态
      selectedValues[index] = val.name
      const key = selectedValues.filter(value => value).join('_')
      // 判断 是否包含该组合
      if (pathMap[key]) {
        val.disabled = false
      } else {
        val.disabled = true
      }
    })
  })
}
```



模板渲染

```vue
<template>
  <div class="goods-sku">
    <dl v-for="item in goods.specs" :key="item.id">
      <dt>{{ item.name }}</dt>
      <dd>
        <!-- 在这里移除 template 上的 key，把 key 移到真实元素上 -->
        <template v-for="val in item.values">
          <!-- 图片类型规格 -->
          <img @click="changeSelectedStatus(item, val)" :class="{ selected: val.selected, disabled: val.disabled }"
            v-if="val.picture" :key="val.name" :src="val.picture" :title="val.name">
          <!-- 文字类型规格 -->
          <span v-else :class="{ selected: val.selected, disabled: val.disabled }"
            @click="changeSelectedStatus(item, val)" :key="val.name + 'text'">{{ val.name }}</span>
        </template>
      </dd>
    </dl>
  </div>
</template>
```



### 子集算法

```js

export default function bwPowerSet (originalSet) {
  const subSets = []

  // We will have 2^n possible combinations (where n is a length of original set).
  // It is because for every element of original set we will decide whether to include
  // it or not (2 options for each set element).
  const numberOfCombinations = 2 ** originalSet.length

  // Each number in binary representation in a range from 0 to 2^n does exactly what we need:
  // it shows by its bits (0 or 1) whether to include related element from the set or not.
  // For example, for the set {1, 2, 3} the binary number of 0b010 would mean that we need to
  // include only "2" to the current set.
  for (let combinationIndex = 0; combinationIndex < numberOfCombinations; combinationIndex += 1) {
    const subSet = []

    for (let setElementIndex = 0; setElementIndex < originalSet.length; setElementIndex += 1) {
      // Decide whether we need to include current element into the subset or not.
      if (combinationIndex & (1 << setElementIndex)) {
        subSet.push(originalSet[setElementIndex])
      }
    }

    // Add current subset to the list of all subsets.
    subSets.push(subSet)
  }

  return subSets
}

```

