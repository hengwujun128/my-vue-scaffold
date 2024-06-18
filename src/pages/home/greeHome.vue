<template>
  <div class="layout">
    <div class="layout-home">
      <div class="left">
        <a-menu
          v-model:selectedKeys="state.selectedKeys"
          style="width: 100%"
          mode="inline"
          :open-keys="state.openKeys"
          :items="routesData"
          @click="clickHandler"
          @open-change="onOpenChange"
        ></a-menu>
      </div>
      <!-- children routes entrance -->
      <router-view v-slot="{ Component, route }">
        <Transition name="fade" mode="out-in">
          <!-- use fullPath to replace name -->
          <div :key="route.fullPath" class="right">
            <component :is="Component" />
          </div>
        </Transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { VueElement, h, reactive } from 'vue'
  import { useRouter } from 'vue-router'

  import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
  import { ItemType } from 'ant-design-vue'

  import directivesRoutes from '@/router/routes/modules/directives.ts'

  const router = useRouter()

  //
  function getItem(
    label: VueElement | string,
    key: string,
    icon?: any,
    children?: ItemType[],
    type?: 'group',
  ): ItemType {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as ItemType
  }

  const items: ItemType[] = reactive([
    // group1
    getItem('Directives', 'sub1', () => h(MailOutlined), [
      getItem('Option 1', '1'),
      getItem('Option 2', '2'),
      getItem('Option 3', '3'),
      getItem('Option 4', '4'),
    ]),
    // group2
    getItem('Components', 'sub2', () => h(AppstoreOutlined), [
      getItem('Option 5', '5'),
      getItem('Option 6', '6'),
      getItem('defineComponents', 'sub3', null, [getItem('Option 7', '7'), getItem('Option 8', '8')]),
    ]),
    // group3
    getItem('Observer', 'sub4', () => h(SettingOutlined), [
      getItem('Option 9', '9'),
      getItem('Option 10', '10'),
      getItem('Option 11', '11'),
      getItem('Option 12', '12'),
    ]),
  ])

  // NOTE: 根据路由配置设置导航菜单(recursively )
  const getItems = (data: any[], level = 0): any[] => {
    let items2: ItemType[] = []
    data.map((item) => {
      // 第三个参数是 icon,根据 level 来决定
      const res = getItem(item.meta.title, item.name, level === 0 ? () => h(MailOutlined) : '')
      items2.push(res)
      if (item.children) {
        level += 1
        const children = getItems(item.children, level)
        items2 = items2.concat(children)
      }
    })
    return items2
  }

  const routesData = getItems([directivesRoutes])
  console.log({ routesData })

  const state = reactive({
    rootSubmenuKeys: ['sub1', 'sub2', 'sub4'],
    openKeys: ['sub1'],
    selectedKeys: [],
  })
  const onOpenChange = (openKeys: string[]) => {
    const latestOpenKey = openKeys.find((key) => state.openKeys.indexOf(key) === -1)
    if (state.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      state.openKeys = openKeys
    } else {
      state.openKeys = latestOpenKey ? [latestOpenKey] : []
    }
  }

  const clickHandler = (item, key, keyPath) => {
    router.push({ name: item.key })
  }
</script>

<style lang="scss" scoped>
  .layout {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0px;
    text-align: center;
    background-color: #fff;
  }
  .layout-home {
    display: grid;
    // grid-template-columns: repeat(2, minmax(min(200px, 100%), 1fr));
    grid-template-columns: 240px 1fr;
    height: 100vh;
    .left {
      // background-color: antiquewhite;
    }
  }
</style>
