<template>
  <el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
    <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="150px" @keyup.enter="submitHandle()">
      <el-form-item prop="name" label="cluster name">
        <el-input v-model="dataForm.name" placeholder="kafka连接名称"></el-input>
      </el-form-item>
      <el-form-item prop="broker" label="cluster server">
        <el-input v-model="dataForm.broker" placeholder="192.168.0.10:9092,192.168.0.11:9092"></el-input>
      </el-form-item>
      <el-form-item prop="username" label="username">
        <el-input v-model="dataForm.username" placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="password">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item prop="remark" label="remark">
        <el-input v-model="dataForm.remark" type="textarea" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitHandle()">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {ElMessage} from 'element-plus/es'
import {addCluster, detail, update} from '@/api/kafka/cluster'
import store from '@/store'
import { useRouter } from 'vue-router'


const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const router = useRouter()

const dataForm = reactive({
  id: '',
  name: '',
  broker: '',
  username: '',
  password: '',
  remark: ''
})

const init = async (id: any) => {

   await router.push({ path: '/topic' })

  visible.value = true
  dataForm.id = id

  if (id) {
    const {data} = await detail(id)
    Object.assign(dataForm, {
      name: data.name,
      broker: data.broker,
      username: data.username,
      password: data.password,
      remark: data.remark
    });
  } else if (dataFormRef.value) {
    // 重置表单数据
    dataFormRef.value.resetFields()
  }
};

const dataRules = ref({
  name: [{required: true, message: '必填项不能为空', trigger: 'blur'}],
  broker: [{required: true, message: '必填项不能为空', trigger: 'blur'}]
})

// 表单提交
const submitHandle = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false
    }

    if (!dataForm.id) {
      addCluster(dataForm).then((res: any) => {
        ElMessage.success({
          message: '操作成功',
          duration: 500,
          onClose: () => {
            visible.value = false
            emit('refreshDataList')
          }
        })
      })
    } else {
      update(dataForm).then((res: any) => {
        ElMessage.success({
          message: '操作成功',
          duration: 500,
          onClose: () => {
            visible.value = false
            emit('refreshDataList')
          }
        })
      })
    }
  })

}

defineExpose({
  init
})
</script>
