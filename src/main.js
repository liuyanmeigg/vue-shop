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
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require style 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import echarts from 'echarts'
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false
// 全局 axios 默认值
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
// 全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear() + 1
  // padStart字符串的补全操作
  const m = (dt.getMonth() + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}),
  Vue.prototype.$http = axios;
Vue.use(ElementUI);
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor);
Vue.component('tree-table', TreeTable);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
