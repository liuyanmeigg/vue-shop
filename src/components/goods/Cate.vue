<template>
  <div class="cate-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-button type="primary" @click="openCateDialog">添加分类</el-button>
      <!-- 商品分类表格区域 -->
      <tree-table
        class="tree-table"
        :data="CatesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        stripe
        border
        index-text="#"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" plain size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" plain size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" plain size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="cateDialogVisible"
      width="50%"
      @close="addCateFormClosed"
    >
      <!-- 添加分类表单 -->
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定数据对象 -->
          <el-cascader
            v-model="selectedKeys"
            expand-trigger="hover"
            :options="parentCateList"
            :props="{value:'cat_id', label:'cat_name', children:'children',checkStrictly: true}"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="editDialogVisible"
      width="60%"
      @close="editDialogClosed"
    >
      <el-form ref="editCateFormRef" :model="editCateForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cates",
  data() {
    return {
      // 添加分类表单数据
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 将要 分类父 ID
        cat_pid: 0,
        // 将要 分类层级
        cat_level: 0
      },
      // 父级分类列表
      parentCateList: [],
      // 控制 分类对话框  的显示与隐藏
      cateDialogVisible: false,
      // 控制 编辑对话框  的显示与隐藏
      editDialogVisible: false,
      // 修改的数据
      editCateForm: {},
      // 商品列表数据
      CatesList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "isOk"
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "opt",
          width: "190px"
        }
      ],

      // 选中的父级分类的ID数组
      selectedKeys: [],
      // 分类表单的验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCatesList();
  },
  methods: {
    // 获取商品数据
    async getCatesList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }
      // 把数据列表赋值给 CatesList
      this.CatesList = res.data.result;
      // 为总数据  条数  赋值
      this.total = res.data.total;
    },
    // 监听 pagesize  每页条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCatesList();
    },
    // 监听  pagenum 当前页码的改变
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getCatesList();
    },
    // 添加分类对话框
    openCateDialog() {
      // 在对话框显示之前先获取数据
      this.getParentCatesList();
      // 再展示对话框
      this.cateDialogVisible = true;
    },
    // 监听添加分类对话框关闭,重置表单
    addCateFormClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_id = 0;
    },
    // 获取父级分类的数据列表
    async getParentCatesList() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！");
      }
      this.parentCateList = res.data;
    },
    // 选择器发生变化触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      // 如果selectedKeys 数组的 length 大于0，证明选中的是父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        // 反之就说明没有选中任何父级分类
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加分类按钮事件
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.warning("填写格式不正确");
        }
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }
        this.$message.success("添加分类成功！");
        this.getCatesList();
        this.cateDialogVisible = false;
      });
    },
    // 删除功能
    async removeCate(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("以取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！");
      }
      this.$message.success("删除成功！");
      this.getCatesList();
    },
    // 编辑功能
    async editCate(id) {
      // 通过id获取分类数据
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询数据失败！");
      }
      this.editCateForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 提交修改
    async addEditCate() {
      if (!this.editCateForm.cat_name) {
        return this.$message.error("内容不能为空");
      }
      const { data: res } = await this.$http.put(
        `categories/${this.editCateForm.cat_id}`,
        {
          cat_name: this.editCateForm.cat_name
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改分类失败！");
      }
      this.getCatesList();
      this.$message.success("修改分类成功！");
      this.editDialogVisible = false;
    }
  }
};
</script>

<style lang='less' scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>