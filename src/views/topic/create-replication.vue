<template>
  <el-dialog v-model="visible" :title="'修改分区数'" :close-on-click-modal="false">
    <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="150px" @keyup.enter="submitHandle()">
      <el-form-item prop="topicName" label="topic name">
        <el-input v-model="dataForm.topicName" placeholder="主题名称" disabled></el-input>
      </el-form-item>
      <el-form-item prop="replication" label="replication count" >
        <el-input v-model="dataForm.replication" placeholder="期望的副本数量"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitHandle()">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus/es";

import { createReplications } from "@/api/kafka/topic";


const emit = defineEmits(["refreshDataList"]);

const visible = ref(false);
const dataFormRef = ref();

const dataForm = reactive({
  brokerId: "",
  topicName: "",
  replication: ""
});

const init = async (brokerId: any, topicName: any) => {
  visible.value = true;
  dataForm.brokerId = brokerId;
  dataForm.topicName = topicName;
  if (dataFormRef.value) {
    dataFormRef.value.resetFields();
  }
};


const dataRules = ref({
  topicName: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
  replication: [{ required: true, message: "必填项不能为空", trigger: "blur" }]
});

// 表单提交
const submitHandle = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false;
    }

    createReplications(dataForm).then((res: any) => {
      ElMessage.success({
        message: "操作成功",
        duration: 500,
        onClose: () => {
          visible.value = false;
          emit("refreshDataList");
        }
      });
    });

  });

};

defineExpose({
  init
});
</script>

<style scoped>
.config-row {
  display: flex;
  gap: 10px;
}
</style>
