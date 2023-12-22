<template>
  <div class="suggestion">
    <van-radio-group v-model="checked">
      <van-radio
        v-for="address in props.list"
        :key="address.id"
        :name="address.id"
        @click.stop="selectAddress(address)"
      >
        <div class="map-item">
          <p class="title">
            <span :style="{ color: checked === address.id ? '#0a65ef' : '' }">
              {{ address.title }}
            </span>
            <span>{{ address._distance }}</span>
          </p>
          <p class="address">
            <span>定位 &nbsp;&nbsp;</span>
            <span>{{ address.address }}</span>
          </p>
        </div>
        <template #icon="prop">
          <van-icon
            size="22"
            :color="prop.checked ? '#0a65ef' : '#8e8e8e'"
            :name="prop.checked ? activeIcon : inactiveIcon"
          />
        </template>
      </van-radio>
      <p v-if="props.list.length" class="noMore">没有更多了...</p>
    </van-radio-group>
  </div>
</template>

<script setup lang="ts">
  import { ref, withDefaults } from 'vue'

  interface Props {
    list: any[]
  }
  export interface Address {
    address?: string
    category?: string
    city?: string
    district?: string
    id?: string
    location: { lat: string; lng: string }
    province?: string
    title?: string
    type?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    list: () => [],
  })

  const emits = defineEmits<{
    check: [value: Address]
  }>()

  const activeIcon = ref('checkbox_selected')
  const inactiveIcon = ref('checkbox_default')

  const checked = ref(false)

  const selectAddress = (v: Address) => {
    console.log(v)
    emits('check', v)
  }
</script>

<style lang="less" scoped>
  * {
    padding: 0;
    margin: 0;
  }
  .suggestion {
    padding: 0px 16px;
    .map-item {
      border-bottom: 1px solid #eee;
      .title {
        color: #2c2c2c;
        margin-bottom: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span:nth-child(2) {
          color: #b6b0b0;
        }
      }
      .address {
        color: #666;
        margin-bottom: 10px;
        font-size: 12px;
      }
    }
    .noMore {
      color: gray;
      padding: 20px 0;
      line-height: 24px;
      font-size: 14px;
      text-align: center;
    }
  }
</style>
