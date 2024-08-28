<template>
  <div>
    <h2>hello this is user </h2>
    <p>
      <span>hello </span>
      <SvgIcon :icon-name="'sun'" style="margin: 0px 8px" :color="'red'"></SvgIcon>
      <span>world</span>
      <SvgIcon :icon-name="'test'" style="margin: 0px 8px"></SvgIcon>
      <SvgIcon :icon-name="'total-sales'" style="margin: 0px 8px"></SvgIcon>
      <SvgIcon :icon-name="'transaction'" style="margin: 0px 8px"></SvgIcon>
      <icon-access-point-check></icon-access-point-check>
      <icon-account-box style="font-size: 2em; color: red" />
    </p>
  </div>
</template>

<script setup lang="ts">
  import SvgIcon from '@/components/svg/Icon.vue'
  // ~icons/{collection}/{icon}
  import IconAccessPointCheck from '~icons/mdi/access-point-check'
  import IconAccountBox from '~icons/mdi/account-box'
</script>

<style lang="scss" scoped>
  * {
    padding: 0;
    margin: 0;
  }

  p {
    height: 30px;
    display: flex;
    align-items: center;
  }
</style>
