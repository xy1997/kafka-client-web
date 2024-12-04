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
          <el-select v-model="selectPartitionOptions" placeholder="partition非必选" @change="partitionChange">
            <el-option v-for="item in partitionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="selectOffsetOptions" placeholder="offset非必选" @change="offsetChange">
            <el-option v-for="item in offsetOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="onButtonClick">订阅</el-button>
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
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";

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
let loadingInstance: any = null;

const createWebSocket = () => {
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
    text: '连接中，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  if (partition.value == null) {
    partition.value = -1;
  }
  if (offset.value == null) {
    offset.value = "latest";
  }
  const uniqueParam = new Date().getTime();


  let wsAddress;

  const environment = import.meta.env.MODE;
  if(environment === "production"){
    const apiUrl = import.meta.env.VITE_API_URL;
     wsAddress = `${window.location.origin.replace(/^http/, 'ws')}${apiUrl.replace('/api', '')}/ws/`;
  }else{
    wsAddress = import.meta.env.VITE_API_WS_URL;
  }

  const WS = wsAddress + "consumer/pool/" + offset.value + "/" + brokerId.value + "/" + topicName.value + "/" + partition.value + "?t=" + uniqueParam;

  websocket = new WebSocket(WS);

  websocket.onopen = () => {
    loadingInstance?.close();
    ElMessageBox.alert("成功订阅" + topicName.value, "订阅", {
      confirmButtonText: "确定",
      type: "success",
    });
    console.log("WebSocket连接已打开");
  };

  websocket.onmessage = (event) => {
    try {
      const newMessage = event.data;
      messages.value = [newMessage, ...messages.value];
    } catch (error) {
      console.error("处理消息时出错:", error);
    }
  };

  websocket.onclose = () => {
    loadingInstance?.close();
    console.log("WebSocket连接已关闭");
    if (websocket && websocket.readyState !== 1 && websocket.readyState !== 0) {
      ElMessageBox.alert("WebSocket连接已关闭，请检查网络或重试连接", "连接断开", {
        confirmButtonText: "确定",
        type: "warning",
        showClose: false,
      });
    }
  };

  websocket.onerror = (err) => {
    loadingInstance?.close();
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
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  messages.value = [];

  createWebSocket();
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
</style>
