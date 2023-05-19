<template>
  <div class="welcome-container">
    <p>欢迎来到电商后台管理系统！</p>
    <img src="@/assets/images/团队-9.png" alt="">
  </div>
</template>

<script>
export default {
  name: "Welcome"
};
</script>

<style lang="less" scoped>
.welcome-container{
  p{
    text-align: center;
    font-size: 20px;
  }
  img{
    width: 100%;
    height: 630px;
  }
}
</style>