<template>
  <!-- 面包屑导航 -->
  <div class="roles-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <!-- 添加角色按钮区域 -->
        <el-button type="primary" @click="addRole">添加角色</el-button>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['dbbottom', i1 === 0? 'bttop':'','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0? '' :'bttop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 通过for循环 嵌套渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环 嵌套渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>{{scope.row}}</pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop="address" label="操作" width="290px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="rolesDialogVisible"
        width="50%"
        @close="addRolesDialogClosed"
      >
        <el-form
          ref="addRolesFormRef"
          :model="addRolesForm"
          :rules="addRolesRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色 对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editDialogVisible"
        width="40%"
        @close="editDialogClosed"
      >
        <el-form
          ref="editRolesFormRef"
          :model="editRolesForm"
          :rules="addRolesRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRolesEdit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightdialogVisible"
        width="30%"
        @close="setRightsDialogClosed"
      >
        <!-- 树形控件   :props属性 指定树形图中出现的数据字符串-->
        <el-tree
          ref="treeRef"
          :data="rightslist"
          :props="treeProps"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="defaultKey"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { Loading } from "element-ui";
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      //   添加角色表单数据对象
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      // 所有权限数据对象
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 当前即将分配权限的ID
      roleID: "",
      // 默认选中的节点ID数组
      defaultKey: [],
      // 修改角色表单数据对象
      editRolesForm: {},
      //   控制  添加角色  表单的显示与隐藏
      rolesDialogVisible: false,
      //   控制  修改角色   表单的显示与隐藏
      editDialogVisible: false,
      //   控制  分配权限对话框的显示与隐藏
      setRightdialogVisible: false,
      //   添加表单规则
      addRolesRules: {
        roleName: [
          { required: true, message: "请填写角色名字", trigger: "blur" },
          { min: 2, max: 5, message: "长度在 2 到 5 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请填写角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    //   获取角色列表
    this.getRolesList();
  },
  methods: {
    //   获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;
      //   console.log(this.rolesList);
    },
    // 添加角色对话框
    addRole() {
      this.rolesDialogVisible = true;
    },
    // 监听添加角色对话框的关闭事件
    addRolesDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    // 点击“确定” 添加角色
    addRoles() {
      // 先验证表单数据是否正确
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return;
        // 验证成功发起axios请求
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        // 失败则返回
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }
        // 成功之后把对话框关闭，并重新渲染页面
        this.$message.success("添加角色成功！");
        this.rolesDialogVisible = false;
        this.getRolesList();
      });
    },
    // 点击“关闭”重置表单
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    // 修改角色
    async editRoles(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色列表失败！");
      }
      this.$message.success("查询角色列表成功！");
      this.editRolesForm = res.data;
    },
    // 点击“确定”，提交修改
    addRolesEdit() {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("内容格式不正确");
        }
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色失败！");
        }
        this.$message.success("修改角色成功！");
        this.editDialogVisible = false;
        this.getRolesList();
      });
    },
    // 删除操作，根据ID删除对应的角色信息
    async removeRole(id) {
      const deleteConfirm = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (deleteConfirm !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("修改角色失败！");
      }
      this.$message.success("修改角色成功！");
      this.getRolesList();
    },
    // 根据ID删除权限
    async removeRightById(role, rightId) {
      // 弹窗提示是否删除
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
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！");
      }
      return this.$message.success("删除成功！");
      // 不建议使用  this.getRolesList() 会出现整体页面的更新
      role.children = res.data;
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleID = role.id;
      this.setRightdialogVisible = true;
      // 获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      this.$message.success("获取权限数据成功！");
      this.rightslist = res.data;
      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defaultKey);
      this.setRightdialogVisible = true;
    },
    // 通过递归的形式获取角色下所有三级权限的ID,并保存到  rightslist  数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    // 监听分配权利对话框的关闭事件
    setRightsDialogClosed() {
      this.defaultKey = [];
    },
    // 点击“确定”为角色分配权限
    async allotRights() {
      // 把选中的和半选中的放在一个数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // 把筛选出来的数据转为字符串
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleID}/rights`,
        {
          rids: idStr
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新分配权限失败！");
      }
      this.$message.success("更新分配权限成功！");
      this.getRolesList();
      this.setRightdialogVisible = false;
    }
  }
};
</script>

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.dbbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>