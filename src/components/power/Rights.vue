<template>
  <div class="rights-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="showDataList" border stripe style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <!-- 通过作用域插槽的形式来自定义输出格式 -->
          <template slot-scope="scope">
            <!-- {{scope.row}} 表示 表格这一行的信息 -->
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 25]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rightsList.length"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return {
      //  权限列表
      rightsList: [],
      pageSize: 5,
      currentPage: 2,
      // 当前要展示到页面上的数据
      showDataList: []
    };
  },
  created() {
    //   获取所有权限
    this.getRightsList();
  },
  methods: {
    //   获取权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！");
      }
      this.rightsList = res.data;
      this.showData();
      //数据分页
      console.log(this.rightsList);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.showData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.showData();
    },
    showData() {
      this.showDataList = [];
      // 从哪个下标开始
      let start = (this.currentPage - 1) * this.pageSize;
      // 循环的次数
      let end = start + this.pageSize;
      for (let i = start; i < end; i++) {
        this.showDataList.push(this.rightsList[i]);
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>