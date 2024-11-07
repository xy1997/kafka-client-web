<template>
  <el-dialog v-model="visible" :title="'新增'" :close-on-click-modal="false">
    <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="150px" @keyup.enter="submitHandle()">
      <el-form-item prop="topicName" label="topic name">
        <el-input v-model="dataForm.topicName" placeholder="主题名称"></el-input>
      </el-form-item>
      <el-form-item prop="partition" label="partition count">
        <el-input v-model="dataForm.partition" placeholder="主分区数"></el-input>
      </el-form-item>
      <el-form-item prop="replication" label="replication count">
        <el-input v-model="dataForm.replication" placeholder="副本数量"></el-input>
      </el-form-item>
      <el-divider content-position="left">Configs</el-divider>

      <!-- 动态生成的配置项 -->
      <div v-for="(config, index) in configArray" :key="index" class="config-row">
        <el-form-item :label="'Config Key ' + (index + 1)">
          <el-input v-model="config.key" placeholder="配置键"></el-input>
        </el-form-item>
        <el-form-item :label="'Config Value ' + (index + 1)">
          <el-input v-model="config.value" placeholder="配置值"></el-input>
        </el-form-item>
      </div>

      <div class="mb-4">
        <el-button type="info" round @click="addConfig">add</el-button>
      </div>
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

import { createTopic } from "@/api/kafka/topic";


const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const configArray = ref<{ key: string; value: string }[]>([]);

const dataForm = reactive({
  brokerId: '',
  topicName: '',
  partition: '',
  replication: '',
  configs: new Map<string, string>()
})

const init = async (brokerId: any) => {
  visible.value = true
  dataForm.brokerId = brokerId
  dataForm.configs.clear();
  if( dataFormRef.value){
    dataFormRef.value.resetFields()
  }

};

const addConfig = () => {
  configArray.value.push({ key: '', value: '' });
};


const dataRules = ref({
  topicName: [{required: true, message: '必填项不能为空', trigger: 'blur'}],
  partition: [{required: true, message: '必填项不能为空', trigger: 'blur'}],
  replication: [{required: true, message: '必填项不能为空', trigger: 'blur'}]
})

// 表单提交
const submitHandle = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false
    }

    dataForm.configs.clear();

    // 遍历 configArray，将其内容添加到 dataForm.configs 中
    configArray.value.forEach(item => {
      if (item.key && item.value) { // 确保 key 和 value 都有值
        dataForm.configs.set(item.key, item.value);
      }
    });

    // 将 dataForm.configs 转换为普通对象
    const configObject = Object.fromEntries(dataForm.configs);
    const payload = { ...dataForm, configs: configObject };

    createTopic(payload).then((res: any) => {
      ElMessage.success({
        message: '操作成功',
        duration: 500,
        onClose: () => {
          visible.value = false
          emit('refreshDataList')
        }
      })
    })

  })

}

defineExpose({
  init
})
</script>

<style scoped>
.config-row {
  display: flex;
  gap: 10px;
}
</style>
