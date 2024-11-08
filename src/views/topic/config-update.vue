<template>
  <el-dialog v-model="visible" :title="'配置信息'" :close-on-click-modal="false" :width="'50%'"
             :style="{ height: '60vh', overflow: 'hidden' }">
    <el-form ref="dataFormRef" :rules="dataRules" label-width="150px" @keyup.enter="submitHandle()">

      <!-- 对话框内容部分，设置滚动条 -->
      <div class="dialog-content">
        <!-- 添加标题和分割线 -->
        <el-row class="title-row">
          <el-col :span="11" class="title-col">
            <span>Key</span>
          </el-col>
          <el-col :span="11" :offset="1" class="title-col">
            <span>Value</span>
          </el-col>
        </el-row>
        <el-divider></el-divider>

        <!-- 添加新配置按钮 -->
        <div class="mb-4">
          <el-button type="info" round @click="addConfig">add</el-button>
        </div>

        <!-- 动态生成的配置项 -->
        <div v-for="(config, index) in configArray" :key="index" class="config-row">
          <el-form-item prop="key">
            <el-input v-model="config.key" placeholder="配置键"></el-input>
          </el-form-item>
          <el-form-item prop="value">
            <el-input v-model="config.value" placeholder="配置值"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" link @click="saveConfig(config.key,config.value)" class="save-btn">save
            </el-button>
            <el-button type="primary" link @click="deleteConfig(config.key,config.value)" class="delete-btn">delete
            </el-button>
          </el-form-item>

        </div>
      </div>
    </el-form>

    <!-- 底部的确定和取消按钮 -->
    <!--    <template #footer>-->
    <!--      <el-button  @click="visible = false">取消</el-button>-->
    <!--      <el-button  type="primary" @click="submitHandle()">确定</el-button>-->
    <!--    </template>-->
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus/es";

import { describeConfigs, incrementalAlterConfigs } from "@/api/kafka/config";
import { ElMessageBox } from "element-plus";
import { deleteTopic } from "@/api/kafka/topic";


const emit = defineEmits(["refreshDataList"]);


interface config {
  name: string;
  value: string;
  source: string;
  type: string;
  readOnly: boolean;
  sensitive: boolean;
}

const visible = ref(false);
const brokerId = ref();
const name = ref();
const dataFormRef = ref();
const configArray = ref<{ key: string; value: string }[]>([]);


const init = async (id: any, topicName: any) => {
  visible.value = true;
  brokerId.value = id;
  name.value = topicName;

  await getDataList();
};

const getDataList = async () => {
  configArray.value = [];

  const parameter = {
    brokerId: brokerId.value,
    name: name.value,
    type: "TOPIC"
  };

  const { data }: { data: config[] } = await describeConfigs(parameter);

  data.forEach(item => {
    if (item.name && item.value) { // 确保 key 和 value 都有值
      configArray.value.push({ key: item.name, value: item.value });
    }
  });

  if (dataFormRef.value) {
    dataFormRef.value.resetFields();
  }
};

const addConfig = () => {
  configArray.value.unshift({ key: "", value: "" });
};


const dataRules = ref({
  key: [{ required: true, message: "必填项不能为空", trigger: "blur" }],
  value: [{ required: true, message: "必填项不能为空", trigger: "blur" }]
});


const saveConfig = async (key: any, value: any) => {
  dataFormRef.value.validate(async (valid: boolean) => {
    const configMap = new Map<string, string>();
    configMap.set(key, value);

    const delParameter = {
      brokerId: brokerId.value,
      name: name.value,
      type: "TOPIC",
      opType: "SET",
      configs: Object.fromEntries(configMap)
    };
    await incrementalAlterConfigs(delParameter);
    await getDataList();
  });
};

const deleteConfig = (key: any, value: any) => {
  ElMessageBox.confirm("确定进行删除操作?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {

      const configMap = new Map<string, string>();
      configMap.set(key, value);

      const delParameter = {
        brokerId: brokerId.value,
        name: name.value,
        type: "TOPIC",
        opType: "DELETE",
        configs: Object.fromEntries(configMap)
      };
      await incrementalAlterConfigs(delParameter);
      await getDataList();
    })
    .catch(() => {
    });
};

// 表单提交
const submitHandle = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false;
    }

    const configMap = new Map<string, string>();

    configArray.value.forEach(item => {
      configMap.set(item.key, item.value);
    });

    //  转换为普通对象
    const configObject = Object.fromEntries(configMap);

    const parameter = {
      brokerId: brokerId.value,
      name: name.value,
      type: "TOPIC"
    };


    // // 遍历 configArray，将其内容添加到 dataForm.configs 中
    // configArray.value.forEach(item => {
    //   if (item.key && item.value) { // 确保 key 和 value 都有值
    //     dataForm.configs.set(item.key, item.value);
    //   }
    // });
    //
    // // 将 dataForm.configs 转换为普通对象
    // const configObject = Object.fromEntries(dataForm.configs);
    // const payload = { ...dataForm, configs: configObject };
    //
    // createTopic(payload).then((res: any) => {
    //   ElMessage.success({
    //     message: '操作成功',
    //     duration: 500,
    //     onClose: () => {
    //       visible.value = false
    //       emit('refreshDataList')
    //     }
    //   })
    // })

  });

};

defineExpose({
  init
});
</script>

<style scoped>
/* 设置内容超出时滚动条 */
.dialog-content {
  height: calc(60vh - 180px); /* 留出空间以适应标题和底部按钮 */
  overflow-y: auto;
  padding-right: 10px;
}

.title-row {
  display: flex;
  align-items: center;
}

.title-col {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.config-row {
  display: flex;
  gap: 20px; /* Increase the space between buttons and inputs */
  align-items: center; /* Make sure elements are aligned properly */
}

/* Add margin to create more space between save and delete buttons */
.delete-btn {
  margin-left: -90px; /* 将按钮向左移动 */
}

.save-btn {
  margin-left: -90px;
}

</style>