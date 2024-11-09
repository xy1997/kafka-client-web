<template>
  <div class="container">
    <div class="top-section">
      <el-row :gutter="10">
        <el-col :span="6">
          <el-select v-model="selectedOption1" placeholder="请选择选项1">
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedOption2" placeholder="请选择选项2">
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedOption3" placeholder="请选择选项3">
            <el-option v-for="item in options3" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="onButtonClick">提交</el-button>
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

const options1 = [{ label: "选项1", value: "option1" }, { label: "选项2", value: "option2" }, {
  label: "选项3",
  value: "option3"
}];
const options2 = [{ label: "选项A", value: "optionA" }, { label: "选项B", value: "optionB" }, {
  label: "选项C",
  value: "optionC"
}];
const options3 = [{ label: "选项X", value: "optionX" }, { label: "选项Y", value: "optionY" }, {
  label: "选项Z",
  value: "optionZ"
}];

const selectedOption1 = ref("");
const selectedOption2 = ref("");
const selectedOption3 = ref("");
const messages = ref<string[]>([]);

let websocket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000;

const createWebSocket = () => {
  // if (websocket) {
  //   websocket.close();
  //   websocket = null;
  // }
  //
  // websocket = new WebSocket("ws://localhost:8080/consumer/pool/1/top1-1/1");
  websocket = new WebSocket("ws://localhost:8080/consumer/pool/1/top1-1/1");

  websocket.onopen = () => {
    console.log("WebSocket连接已打开");
    reconnectAttempts = 0;
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

const attemptReconnect = () => {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`WebSocket重连尝试 #${reconnectAttempts}...`);
    setTimeout(() => {
      createWebSocket();
    }, reconnectDelay);
  } else {
    console.log("WebSocket连接重连已达到最大次数");
  }
};

const onButtonClick = () => {
  console.log("提交按钮点击了", selectedOption1.value, selectedOption2.value, selectedOption3.value);
};

onMounted(() => {
  createWebSocket();
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
