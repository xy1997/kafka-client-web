<template>
  <div class="container">
    <div class="top-section">
      <el-row :gutter="10">
        <el-col :span="3">
          <el-select v-model="selectBrokerOptions" placeholder="broker" @change="brokerChange">
            <el-option v-for="item in brokerOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="selectedTopicOptions" placeholder="topic" @change="topicChange">
            <el-option v-for="item in topicOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="selectPartitionOptions" placeholder="partition" @change="partitionChange">
            <el-option v-for="item in partitionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="selectOffsetOptions" placeholder="offset" @change="offsetChange">
            <el-option v-for="item in offsetOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="onButtonClick">连接</el-button>
        </el-col>
      </el-row>
    </div>

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
import { ref, onMounted, watchEffect, onUnmounted } from "vue";
import { loadBroker } from "@/api/kafka/cluster";
import { loadPartition, loadTopic } from "@/api/kafka/topic";
import { ElMessage } from "element-plus/es";

const brokerId = ref();
const topicName = ref();
const partition = ref();
const offset = ref();

const brokerOptions = ref();
const topicOptions = ref();
const partitionOptions = ref();
const offsetOptions = [{ label: "earliest", value: "earliest" }, { label: "latest", value: "latest" }];

const selectBrokerOptions = ref("");
const selectedTopicOptions = ref("");
const selectPartitionOptions = ref("");
const selectOffsetOptions = ref("");

const messages = ref<string[]>([]);

let websocket: WebSocket | null = null;

const createWebSocket = () => {


  if (brokerId.value == null) {
    ElMessage.warning("请选择broker");
    return;
  }
  if (topicName.value == null) {
    ElMessage.warning("请选择topic");
    return;
  }
  if (partition.value == null) {
    partition.value = -1;
  }
  if (offset.value == null) {
    offset.value = "latest";
  }

  console.log("brokerId = " + brokerId.value + "  topicName = " + topicName.value + "  partition = " + partition.value + "  offset = " + offset.value);
  const WS = import.meta.env.VITE_API_WS_URL as string + "/consumer/pool/" + offset.value + "/" + brokerId.value + "/" + topicName.value + "/" + partition.value;

  websocket = new WebSocket(WS);

  websocket.onopen = () => {
    console.log("WebSocket连接已打开");
  };

  websocket.onmessage = (event) => {
    console.log("收到消息:", event.data);
    const newMessage = event.data;
    messages.value = [newMessage, ...messages.value]; // 新消息添加到数组前端
  };

  websocket.onclose = () => {
    console.log("WebSocket连接已关闭");
    //  attemptReconnect();
  };

  websocket.onerror = (err) => {
    console.log("WebSocket发生错误:", err);
    websocket?.close();
  };
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

const offsetChange = async (e: any) => {
  offset.value = e;
};

const onButtonClick = () => {

  createWebSocket();
};

onMounted(async () => {
  const { data } = await loadBroker();
  brokerOptions.value = data;
});

onUnmounted(() => {
  if (websocket) {
    websocket.close(); // 确保在组件销毁时关闭连接
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
</style>
