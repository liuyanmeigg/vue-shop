<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col class="cat_opt">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            expand-trigger="hover"
            :options="CateList"
            :props="{ value: 'cat_id', label: 'cat_name' }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- taby 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParams"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="TagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-row>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="editParams(scope.row.attr_id)"
                    >修改</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeParams(scope.row.attr_id)"
                    >删除</el-button
                  >
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态参数的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addParams"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="TagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <!-- 操作 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-row>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="editParams(scope.row.attr_id)"
                    >修改</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeParams(scope.row.attr_id)"
                    >删除</el-button
                  >
                </el-row>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--   添加 对话框 -->
    <el-dialog
      :title="'添加' + TextTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addParamsDialogClosed"
    >
      <el-form
        ref="addParamsRef"
        :model="addParamsForm"
        :rules="addParamsDialogRules"
      >
        <el-form-item :label="TextTitle" prop="attr_name" label-width="80px">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ConfirmAddParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- "修改" 对话框 -->
    <el-dialog
      :title="'修改' + TextTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <el-form
        ref="editParamsRef"
        :model="editParamsForm"
        :rules="addParamsDialogRules"
      >
        <el-form-item :label="TextTitle" prop="attr_name" label-width="80px">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ConfirmAEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  name: 'Params',
  data() {
    return {
      // @change="handleChange" 此事件的结果返回值就是选中的ID值的数组，数据放在了v-model="selectedCateKeys"
      // 级联选择器双向绑定到的数组
      selectedCateKeys: [],
      CateList: [],
      // 标签页双向绑定的标签名,也就是被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      addParamsForm: {},
      addParamsDialogRules: {
        attr_name: [
          {
            required: true,
            message: `请输入参数名称`,
            trigger: 'blur'
          },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      editParamsForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 如果按钮需要被禁用就返回true,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的ID
    CateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    TextTitle() {
      if (this.activeName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    }
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据列表失败！');
      }
      this.CateList = res.data;
    },
    // 级联选择框发生变化会触发这个函数
    handleChange() {
      // console.log(this.selectedCateKeys);
      this.getParamsData();
    },
    // 获取参数列表数据
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      // 根据所选分类的ID和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.CateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数列表失败！');
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        item.inputVisible = false;
        item.inputValue = '';
      });

      if (this.activeName === 'many') {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // Tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
      // console.log(this.activeName); //选中的标签名
    },
    addParams() {
      this.addDialogVisible = true;
    },
    // 监听添加对话框的关闭事件
    addParamsDialogClosed() {
      this.$refs.addParamsRef.resetFields();
    },
    // 提交添加对话框
    ConfirmAddParams() {
      this.$refs.addParamsRef.validate(async (valid) => {
        if (!valid) return this.$message.warning('输入内容不能为空');
        const { data: res } = await this.$http.post(
          `categories/${this.CateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error('更新参数失败！');
        }
        this.$message.success('更新参数成功！');
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 监听编辑对话框的关闭事件
    editParamsDialogClosed() {
      this.$refs.editParamsRef.resetFields();
    },
    // 修改对话框
    async editParams(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(
        `categories/${this.CateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.TextTitle
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数数据失败');
      }
      this.editParamsForm = res.data;
    },
    // 提交修改对话框数据
    ConfirmAEditParams() {
      this.$refs.editParamsRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.warning('填写内容不规范');
        }
        const { data: res } = await this.$http.put(
          `categories/${this.CateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数数据失败');
        }
        this.getParamsData();
        this.$message.success('更新参数数据成功');
        this.editDialogVisible = false;
      });
    },
    // 删除事件的监听
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err);

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除');
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.CateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数数据失败');
      }
      this.getParamsData();
      this.$message.success('删除参数数据成功');
      this.editDialogVisible = false;
    },
    // 根据索引，监听标签的删除事件
    handleClose(i, row) {
      row.attr_vals.splice(row.attr_vals.indexOf(i), 1);
      this.saveAttrVals(row);
    },
    // 将对row.attr_vals 的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.CateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败');
      }
      this.$message.success('修改参数项成功');
    },
    // 文本框失去焦点或按下“enter”键都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      // 如果没有return则证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;
      // 需要发起请求，保存这次数据
      this.saveAttrVals(row);
    },
    // 点击按钮，展示文本框
    showInput(item) {
      item.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick方法的作用是在页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(() => {
        this.$refs.TagInputRef.$refs.input.focus();
      });
    }
  }
};
</script>

<style lang='less' scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>