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
        <el-table-column prop="isInternal" label="isInternal" header-align="center" align="center"
                         :style="{ width: '20%' }"></el-table-column>
        <el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
          <template #default="scope">
            <el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
            <el-button v-if="!scope.row.isInternal" type="primary" link @click="deleteBatch(scope.row.name)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
    </el-card>

</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useCrud } from "@/hooks";
import { reactive, ref, onMounted, computed } from "vue";
import AddOrUpdate from "./add-or-update.vue";
import { IHooksOptions } from "@/hooks/interface";
import { loadBroker } from "@/api/kafka/cluster";
import { deleteTopic } from "@/api/kafka/topic";

const addOrUpdateRef = ref();
const route = useRoute();
const brokerId = ref();
const options = ref();

const createNeed = computed(() => {
  return  Boolean(route.params.id) && !isNaN(Number(brokerId.value)); // 返回 true 或 false
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
  console.log("route.params.id = " + route.params.id)
  brokerId.value = route.params.id as string;

  const { data } = await loadBroker();
  options.value = data;
});



const brokerChange = async(e: any) => {
    await getDataList();
}

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

  await deleteTopic(parameter);
  await getDataList();
};


const { getDataList, selectionChangeHandle } = useCrud(state);
</script>
