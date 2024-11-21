<template>
  <el-card>
    <el-form :inline="true" :model="state.queryForm">
      <el-form-item>
        <el-select v-model="state.queryForm.brokerId" @change="brokerChange" placeholder="Select"
                   style="width: 240px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="deleteBatch()">删除</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 80%"
              @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="name" label="topic name" header-align="center" align="center"
                       :style="{ width: '80%' }"></el-table-column>
      <el-table-column label="partitions" header-align="center" align="center">
        <template #default="scope">
          <el-popover placement="top-start" :width="460" trigger="click" @show="showPartitions(scope.row.name)">
            <template #reference>
              <el-button type="primary" link>partition</el-button>
            </template>

            <!-- 使用 el-scrollbar 包裹 el-table 并限制最大高度 -->
            <el-scrollbar style="max-height: 300px; overflow-y: auto;">
              <el-table :data="partitionsData" v-loading="partitionsLoading">
                <el-table-column width="150" property="partition" label="partition" />

                <el-table-column label="replicas" header-align="center" align="center">
                  <template #default="scope">
                    <el-popover placement="right" :width="460" trigger="click"
                                @show="showReplicas(scope.row.partition)">
                      <template #reference>
                        <el-button type="primary" link>replica</el-button>
                      </template>

                      <!-- 内层 popover 也使用 el-scrollbar 包裹 el-table -->
                      <el-scrollbar style="max-height: 200px; overflow-y: auto;">
                        <el-table :data="replicasData" v-loading="replicasLoading">
                          <el-table-column width="80" property="id" label="id" />
                          <el-table-column width="80" property="host" label="host" />
                          <el-table-column width="80" property="port" label="port" />
                          <el-table-column width="80" property="inSync" label="inSync" />
                          <el-table-column width="85" property="isLeader" label="isLeader" />
                        </el-table>
                      </el-scrollbar>
                    </el-popover>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="isInternal" label="isInternal" header-align="center" align="center"
                       :style="{ width: '20%' }"></el-table-column>
      <el-table-column label="configs" fixed="right" header-align="center" align="center" width="150">
        <template #default="scope">
          <el-button type="primary" link @click="configHandle(scope.row.name)">configs</el-button>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" header-align="center" align="center" width="300">
        <template #default="scope">
          <el-button type="primary" link @click="createPartitions(scope.row.name)">修改分区数</el-button>
          <el-button type="primary" link @click="alterPartitionReassignments(scope.row.name)">修改副本数</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
    <config ref="configRef" @refreshDataList="getDataList"></config>
    <create-partition ref="createPartitionRef" @refreshDataList="getDataList"></create-partition>
    <create-replication ref="createReplicationRef" @refreshDataList="getDataList"></create-replication>
  </el-card>

</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useCrud } from "@/hooks";
import { computed, onMounted, reactive, ref } from "vue";
import AddOrUpdate from "./add-or-update.vue";
import config from "./config-update.vue";
import createPartition from "./create-partition.vue";
import replication from "./create-replication.vue";
import { IHooksOptions } from "@/hooks/interface";
import { loadBroker } from "@/api/kafka/cluster";
import { deleteTopic, describeTopics } from "@/api/kafka/topic";
import { ElMessageBox } from "element-plus";
import CreateReplication from "@/views/topic/create-replication.vue";

interface Partition {
  partition: string;
  replicas: Replica[];
}

interface Replica {
  id: number;
  host: string;
  port: number;
  address: string;
  inSync: boolean;
  isLeader: boolean;
}

const addOrUpdateRef = ref();
const configRef = ref();
const route = useRoute();
const brokerId = ref();
const options = ref();
const createPartitionRef = ref();
const createReplicationRef = ref();

const partitionsLoading = ref();
const partitionsData = ref<Partition[]>([]);
const replicasData = ref<Replica[]>([]);

const replicasLoading = ref();

const createNeed = computed(() => {
  return Boolean(route.params.id) && !isNaN(Number(brokerId.value)); // 返回 true 或 false
});

const state: IHooksOptions = reactive({
  dataListUrl: "/kafka/topic/listTopic",
  isPage: false,
  queryForm: {
    brokerId: brokerId
  },
  createdIsNeed: createNeed,
  primaryKey: "name"
});


onMounted(async () => {
  if (route.params.id !== ":id") {
    brokerId.value = route.params.id as string;
  }


  const { data } = await loadBroker();
  options.value = data;
});


const brokerChange = async (e: any) => {
  await getDataList();
};

const deleteBatch = async (key?: string) => {
  const topics = ref<string[]>([]);

  if (key) {
    topics.value.push(key);
  } else {
    state.dataListSelections?.forEach((item) => {
      topics.value.push(item);
    });
  }
  //组建对象
  const parameter = { brokerId: brokerId.value, topicNames: topics.value };

  ElMessageBox.confirm("确定进行删除操作?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await deleteTopic(parameter);
      await getDataList();
    })
    .catch(() => {
    });
};


const showPartitions = async (name: any) => {
  partitionsLoading.value = true;

  if (partitionsData.value) {
    partitionsData.value = [];
  }

  try {
    const { data } = await describeTopics(brokerId.value, name);
    console.log(JSON.stringify(data));

    partitionsData.value = data.partitions;
  } finally {
    partitionsLoading.value = false;
  }
};

const showReplicas = async (partition: any) => {
  replicasLoading.value = true;

  try {
    if (replicasData.value) {
      replicasData.value = [];
    }
    const data = partitionsData.value.find(item => item.partition == partition);
    replicasData.value = data?.replicas || [];
  } finally {
    replicasLoading.value = false;
  }
};


const addOrUpdateHandle = () => {
  addOrUpdateRef.value.init(brokerId.value);
};

const configHandle = (name: string) => {
  configRef.value.init(brokerId.value, name);
};

/**
 * 修改分区数
 */
const createPartitions = (name: string) => {
  createPartitionRef.value.init(brokerId.value, name);
};

/**
 * 修改副本数
 */
const alterPartitionReassignments = (name: string) => {
  createReplicationRef.value.init(brokerId.value, name);
};

const { getDataList, selectionChangeHandle } = useCrud(state);
</script>
