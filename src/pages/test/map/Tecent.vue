<template>
  <div class="map">
    <div id="mapWrapper" ref="mapRef"> </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const mapRef = ref(null)

  //地图初始化函数，本例取名为init，开发者可根据实际情况定义
  function initMap() {
    //定义地图中心点坐标
    var center = new window.TMap.LatLng(39.98412, 116.307484)
    //定义map变量，调用 TMap.Map() 构造函数创建地图
    var map = new window.TMap.Map(mapRef.value, {
      center: center, //设置地图中心点坐标
      zoom: 17.2, //设置地图缩放级别
      pitch: 30.5, //设置俯仰角
      rotation: 45, //设置地图旋转角度
    })
  }

  onMounted(() => {
    initMap()
  })
</script>

<style lang="scss" scoped>
  .map {
    margin: 20px auto;
  }
  #mapWrapper {
    width: 1200px;
    height: 400px;
  }
</style>
