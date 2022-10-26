import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 导入公共样式
import './assets/css/global.css';
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入element UI组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import TreeTable from 'vue-table-with-tree-grid'
Vue.config.productionTip = false
// 请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
// axios请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config);
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后 必须return config
  return config
})
Vue.prototype.$http = axios;
Vue.use(ElementUI);
Vue.component('tree-table', TreeTable);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
