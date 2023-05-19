<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrdersList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table border stripe :data="OrdersList">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号"
          width="280px"
        ></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="80px"
        ></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px">
          <template slot-scope="scope">
            <!-- 注意：去接口文档看是  数值型1  还是  字符串‘1’ -->
            <el-tag type="success" v-show="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-show="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="80px"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">{{
            scope.row.create_time | dateFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="editAddress"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              circle
              @click="showProgress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
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
      <!--  修改地址   对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="30%"
        @close="editAddressClosed"
      >
        <el-form
          ref="editFormRef"
          :model="editAddressForm"
          :rules="editAddressRules"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              :options="cityData"
              v-model="editAddressForm.address1"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editAddressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 展示物流进度的对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="30%">
        <el-form ref="editFormRef" :model="progressInfo">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="progressVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata';
export default {
  name: 'Order',
  data() {
    return {
      searchInput: '',
      searchList: [],
      //   查询订单列表请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      OrdersList: [],
      total: 0,
      cityData: cityData,
      // 修改对话框的数据
      editAddressForm: {
        address1: [],
        address2: ''
      },
      addressVisible: false,
      progressVisible: false,
      progressInfo: [],
      editAddressRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败');
      }
      this.OrdersList = res.data.goods;
      this.total = res.data.total;
    },
    // 监听页面条数的变化
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getOrdersList();
    },
    // 监听当前是第几页
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getOrdersList();
    },
    // 监听修改对话框的打开
    editAddress() {
      this.addressVisible = true;
    },
    // 监听修改地址对话框的关闭事件
    editAddressClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 监听物流信息对话框的打开
    async showProgress() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580');
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败');
      }
      this.progressInfo = res.data;
      this.progressVisible = true;
      console.log(this.progressInfo);
    }
  }
};
</script>

<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>