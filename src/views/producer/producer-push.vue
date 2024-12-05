<template>
  <div class="container">
    <div class="top-section">
      <el-row :gutter="10" type="flex" justify="start" align="middle">
        <!-- Broker Dropdown -->
        <el-col :span="3">
          <el-select v-model="selectBrokerOptions" placeholder="broker" @change="brokerChange">
            <el-option v-for="item in brokerOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <!-- Topic Dropdown -->
        <el-col :span="3">
          <el-select v-model="selectedTopicOptions" placeholder="topic" @change="topicChange">
            <el-option v-for="item in topicOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <!-- Partition Dropdown -->
        <el-col :span="3">
          <el-select v-model="selectPartitionOptions" placeholder="partition非必选" @change="partitionChange">
            <el-option v-for="item in partitionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <!-- Push Button -->
        <el-col :span="3">
          <el-button type="primary" @click="onButtonClick">推送</el-button>
        </el-col>
      </el-row>

      <!-- Textarea (富文本框) -->
      <el-row>
        <el-col :span="24">
          <el-input type="textarea" v-model="textAreaContent" placeholder="请输入内容" rows="4"></el-input>
        </el-col>
      </el-row>
    </div>

    <!-- Bottom Section with Gray Background -->
    <div class="bottom-section">
      <div class="gray-background" ref="scrollContainer">
        <div v-for="(message, index) in messages" :key="message + '-' + index" class="message">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import { loadBroker } from "@/api/kafka/cluster";
import { loadPartition, loadTopic } from "@/api/kafka/topic";
import { sendMessageApi } from "@/api/kafka/producer";
import { ElMessage, ElLoading } from "element-plus";

const brokerId = ref();
const topicName = ref();
const partition = ref();

const brokerOptions = ref();
const topicOptions = ref();
const partitionOptions = ref();

const selectBrokerOptions = ref("");
const selectedTopicOptions = ref("");
const selectPartitionOptions = ref("");

// 定义文本域内容的 ref
const textAreaContent = ref("");

const messages = ref<string[]>([]);
let websocket: WebSocket | null = null;
let loadingInstance: any = null;

const sendMessage = async () => {

  if (brokerId.value == null) {
    ElMessage.warning("请选择broker");
    return;
  }
  if (topicName.value == null) {
    ElMessage.warning("请选择topic");
    return;
  }
  loadingInstance = ElLoading.service({
    lock: true,
    text: "连接中，请稍候...",
    background: "rgba(0, 0, 0, 0.7)"
  });

  const parameter = {
    brokerId: brokerId.value,
    topic: topicName.value,
    partition: partition.value,
    message: textAreaContent.value
  };
  try {
    await sendMessageApi(parameter).then((res: any) => {
      messages.value = [textAreaContent.value, ...messages.value];
      textAreaContent.value = "";
    });
  } finally {
    loadingInstance?.close();
  }


  // websocket.onmessage = (event) => {
  //   try {
  //     const newMessage = event.data;
  //     messages.value = [newMessage, ...messages.value];
  //   } catch (error) {
  //     console.error("处理消息时出错:", error);
  //   }
  // };
};

const brokerChange = async (e: any) => {
  brokerId.value = e;
  topicOptions.value = [];
  const { data } = await loadTopic(e);
  topicOptions.value = data;
};

const topicChange = async (e: any) => {
  topicName.value = e;
  partitionOptions.value = [];
  const { data } = await loadPartition(brokerId.value, e);
  partitionOptions.value = data;
};

const partitionChange = async (e: any) => {
  partition.value = e;
};

const onButtonClick = () => {
  sendMessage();
};

onMounted(async () => {
  const { data } = await loadBroker();
  brokerOptions.value = data;
});

onUnmounted(() => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
});

watchEffect(() => {
  console.log("Updated messages:", messages.value);
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-section {
  padding: 20px;
  background-color: #fff;
}

.bottom-section {
  flex: 1;
  background-color: #f0f0f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.gray-background {
  background-color: #f0f0f0;
  padding: 20px;
  max-height: 80%;
  overflow-y: auto;
  border: 1px solid #ccc;
  flex: 1;
}

.message {
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

/* Adjust input fields and layout */
.el-row {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}
</style>
