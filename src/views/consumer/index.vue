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
      <el-table-column prop="groupId" label="groupId" header-align="center" align="center"
                       width="300"></el-table-column>
      <el-table-column prop="state" label="state" header-align="center" align="center"></el-table-column>

      <el-table-column label="members" header-align="center" align="center">
        <template #default="scope">
          <el-popover placement="top-start" :width="460" trigger="click" @show="showMembers(scope.row.groupId)">
            <template #reference>
              <el-button type="primary" link>members</el-button>
            </template>

            <!-- 使用 el-scrollbar 包裹 el-table 并限制最大高度 -->
            <el-scrollbar style="max-height: 300px; overflow-y: auto;">
              <el-table :data="membersData" v-loading="partitionsLoading">
                <el-table-column prop="consumerId" label="consumerId" header-align="center"
                                 align="center"></el-table-column>
                <el-table-column prop="clientId" label="clientId" header-align="center"
                                 align="center"></el-table-column>
                <el-table-column prop="host" label="host" header-align="center" align="center"></el-table-column>
              </el-table>
            </el-scrollbar>
          </el-popover>
        </template>
      </el-table-column>


      <el-table-column label="offsets" fixed="right" header-align="center" align="center" width="150">
        <template #default="scope">
          <el-button type="primary" link @click="offsetsHandle(scope.row.groupId)">offsets</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗, 新增 / 修改 -->
    <offset ref="offsetRef" @refreshDataList="getDataList"></offset>
  </el-card>

</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useCrud } from "@/hooks";
import { computed, onMounted, reactive, ref } from "vue";
import AddOrUpdate from "./add-or-update.vue";
import offset from "./consumer-offset.vue";
import { IHooksOptions } from "@/hooks/interface";
import { loadBroker } from "@/api/kafka/cluster";


interface Member {
  consumerId: string,
  clientId: string,
  host: string
}

const offsetRef = ref();
const route = useRoute();
const brokerId = ref();
//下拉框 broker数据
const options = ref();

const partitionsLoading = ref();
const membersData = ref<Member[]>([]);

const createNeed = computed(() => {
  return Boolean(route.params.id) && !isNaN(Number(brokerId.value)); // 返回 true 或 false
});

const state: IHooksOptions = reactive({
  dataListUrl: "/kafka/consumer/listConsumerGroups",
  isPage: false,
  queryForm: {
    brokerId: brokerId
  },
  createdIsNeed: createNeed,
  primaryKey: "name"
});

onMounted(async () => {
  brokerId.value = route.params.id as string;

  const { data } = await loadBroker();
  options.value = data;
});


const brokerChange = async (e: any) => {
  await getDataList();
};

const showMembers = async (groupId: any) => {
  partitionsLoading.value = true;

  if (membersData.value) {
    membersData.value = [];
  }

  try {
    const group =  (state.dataList as any[]).filter(item => {
      return item.groupId == groupId;
    })[0];


    membersData.value = (group as any).members
  } finally {
    partitionsLoading.value = false;
  }
};

const offsetsHandle = (groupId: any) => {
  offsetRef.value.init(brokerId.value,groupId);
};


const { getDataList, selectionChangeHandle } = useCrud(state);
</script>
