<template>
  <el-dialog v-model="visible" :title="'offset info'" :close-on-click-modal="false" :width="'70%'"
             :style="{ height: '60vh', overflow: 'hidden' }">
    <el-card>
      <el-scrollbar style="max-height: 400px; overflow-y: auto;">
        <el-table v-loading="loading" :data="configArray" border style="width: 100%">
          <el-table-column prop="topic" label="topic" header-align="center" align="center"
                           width="300"></el-table-column>
          <el-table-column prop="partition" label="partition" header-align="center" align="center"></el-table-column>
          <el-table-column prop="beginOffset" label="beginOffset" header-align="center"
                           align="center"></el-table-column>
          <el-table-column prop="endOffset" label="endOffset" header-align="center" align="center"></el-table-column>
          <el-table-column prop="offset" label="offset" header-align="center" align="center"></el-table-column>
          <el-table-column prop="lag" label="lag" header-align="center" align="center"></el-table-column>
        </el-table>
      </el-scrollbar>
    </el-card>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { listTopicInfoOfConsumer } from "@/api/kafka/consumer";


const emit = defineEmits(["refreshDataList"]);


interface offset {
  endOffset: number;
  partition: number;
  lag: number;
  offset: number;
  topic: string;
  beginOffset: number;
}

const visible = ref(false);
const brokerId = ref();
const groupId = ref();
const dataFormRef = ref();
const configArray = ref<{
  topic: string;
  partition: number,
  beginOffset: number,
  endOffset: number,
  offset: number,
  lag: number
}[]>([]);

const loading = ref();

const init = async (id: any, gid: any) => {
  visible.value = true;
  brokerId.value = id;
  groupId.value = gid;

  await getDataList();
};

const getDataList = async () => {
  configArray.value = [];
  loading.value = true;

  try {
    const { data }: { data: offset[] } = await listTopicInfoOfConsumer(brokerId.value, groupId.value);

    data.forEach(item => {
      configArray.value.push({
        topic: item.topic,
        partition: item.partition,
        beginOffset: item.beginOffset,
        endOffset: item.endOffset,
        offset: item.offset,
        lag: item.lag
      });
    });

    if (dataFormRef.value) {
      dataFormRef.value.resetFields();
    }
  } finally {
    loading.value = false
  }
};


defineExpose({
  init
});
</script>
