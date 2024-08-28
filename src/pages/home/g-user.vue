<template>
  <div class="g-user">
    <h2>hello this is user </h2>
    <p>
      <span>自定义 svg icon</span>
      <SvgIcon :icon-name="'sun'" style="margin: 0px 8px" :color="'red'"></SvgIcon>
      <span>只接把 icon 的 svg 下载下来使用</span>
      <SvgIcon :icon-name="'test'" style="margin: 0px 8px"></SvgIcon>
      <SvgIcon :icon-name="'total-sales'" style="margin: 0px 8px"></SvgIcon>
      <SvgIcon :icon-name="'transaction'" style="margin: 0px 8px"></SvgIcon>
    </p>
    <p>
      <span>不需要将图标先下载到本地，从一些开源的图标库中自动导入图标</span>
      <icon-access-point-check></icon-access-point-check>
      <icon-account-box style="font-size: 2em; color: red" />
    </p>
    <p
      ><span>mdi-light: 设置字体宽高</span>
      <IconLightArrowRightCircle style="font-size: 24px; width: 30px; height: 30px" />
      <IconAccountOutline style="font-size: 24px; width: 30px; height: 30px"></IconAccountOutline>
      <IconArrowLeftCircle style="font-size: 24px; width: 30px; height: 30px"></IconArrowLeftCircle>
      <IconArrowRightCircle style="font-size: 24px; width: 30px; height: 30px"></IconArrowRightCircle>
      <IconLogosGitlab style="font-size: 24px; width: 30px; height: 30px"></IconLogosGitlab>
    </p>
    <p>
      <span>使用iconify-vue组件:Icon name is a string, which has 3 parts: </span>
      <Icon icon="mdi-light:home" :style="{ fontSize: '24px' }" @on-load="onLoadHandler" />
      <Icon icon="cil:paper-plane" :style="{ fontSize: '24px', color: 'red' }" />
      <Icon icon="cil:truck" class="big-icon" />
      <Icon icon="mdi:home" height="auto" />
    </p>
  </div>
</template>

<script setup lang="ts">
  import SvgIcon from '@/components/svg/Icon.vue'
  // ~icons/{collection}/{icon}
  import IconAccessPointCheck from '~icons/mdi/access-point-check'
  import IconAccountBox from '~icons/mdi/account-box'
  import IconArrowLeftCircle from '~icons/mdi-light/arrow-left-circle'
  import IconArrowRightCircle from '~icons/mdi-light/arrow-right-circle'

  import IconLightArrowRightCircle from '~icons/mdi-light/account'
  import IconAccountOutline from '~icons/mdi/account-outline'
  import IconLogosGitlab from '~icons/logos/gitlab'

  import { Icon } from '@iconify/vue'

  const onLoadHandler = () => {
    console.log('onLoadHandler')
  }
</script>

<style lang="scss" scoped>
  * {
    padding: 0;
    margin: 0;
  }

  .g-user {
    padding: 16px;
  }

  p {
    height: 30px;
    display: flex;
    align-items: center;
  }
  .big-icon {
    font-size: 24px;
  }
</style>
