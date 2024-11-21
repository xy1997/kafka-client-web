<template>
  <el-dialog v-model="visible" :title="'修改分区数'" :close-on-click-modal="false">
    <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="150px" @keyup.enter="submitHandle()">
      <el-form-item prop="topicName" label="topic name">
        <el-input v-model="dataForm.topicName" placeholder="主题名称" disabled></el-input>
      </el-form-item>
      <el-form-item prop="partition" label="partition count" >
        <el-input v-model="dataForm.partition" placeholder="期望的主分区数"></el-input>
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

import { createPartitions, createTopic } from "@/api/kafka/topic";


const emit = defineEmits(["refreshDataList"]);

const visible = ref(false);
const dataFormRef = ref();
const configArray = ref<{ key: string; value: string }[]>([]);

const dataForm = reactive({
  brokerId: "",
  topicName: "",
  partition: ""
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
  partition: [{ required: true, message: "必填项不能为空", trigger: "blur" }]
});

// 表单提交
const submitHandle = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false;
    }

    createPartitions(dataForm).then((res: any) => {
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
