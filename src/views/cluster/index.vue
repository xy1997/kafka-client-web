<template>
  <el-card>
    <el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
      <el-form-item>
        <el-input v-model="state.queryForm.broker" placeholder="cluster server" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%"
              @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="name" label="cluster name" header-align="center" align="center"
                       width="300"></el-table-column>
      <el-table-column prop="broker" label="cluster server" header-align="center" align="center"
                       show-overflow-tooltip></el-table-column>
      <el-table-column label="brokers" header-align="center" align="center">
        <template #default="scope">
          <el-popover placement="right" :width="460" trigger="click" @show="showBrokers(scope.row.id)">
            <template #reference>
<!--              <el-icon size="20">
                <InfoFilled />
              </el-icon>-->
              <el-button type="primary" link >broker</el-button>
            </template>
            <el-table :data="brokersData" v-loading="brokerLoading">
              <el-table-column width="150" property="host" label="host" />
              <el-table-column width="150" property="port" label="port" />
              <el-table-column width="150" property="controller" label="controller" />
            </el-table>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="topics" header-align="center" align="center">
        <template #default="scope">
            <el-button type="primary" link @click="showTopics(scope.row.id)">topic</el-button>
        </template>
      </el-table-column>

      <el-table-column prop="createdTime" label="创建时间" header-align="center" align="center"
                       width="180"></el-table-column>
      <el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
        <template #default="scope">
          <el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="state.page"
      :page-sizes="state.pageSizes"
      :page-size="state.limit"
      :total="state.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    >
    </el-pagination>

    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
  </el-card>
</template>

<script setup lang="ts">
import { useCrud } from "@/hooks";
import { reactive, ref } from "vue";
import AddOrUpdate from "./add-or-update.vue";
import { IHooksOptions } from "@/hooks/interface";
import { InfoFilled } from "@element-plus/icons-vue";
import { describeCluster } from "@/api/kafka/cluster";
import { useRouter } from 'vue-router'
import{ tabClick } from "@/layout/components/Tabs/index.vue"


const state: IHooksOptions = reactive({
  dataListUrl: "/kafka/broker/searchPage",
  deleteUrl: "/kafka/broker/deleteBatch"
  // queryForm: {
  // 	username: '',
  // 	mobile: ''
  // }
});

const addOrUpdateRef = ref()
//broker 数据
const brokersData = ref([])
const brokerLoading = ref()
const router = useRouter()

const addOrUpdateHandle = (id?: number) => {
  addOrUpdateRef.value.init(id);
};

const showBrokers = async (id: any) => {
  brokerLoading.value = true;

  if (brokersData.value) {
    brokersData.value = [];
  }

  try {
    const { data } = await describeCluster(id);
    brokersData.value = data.nodes;
  } finally {
    brokerLoading.value = false;
  }
};

const showTopics = async (id: any) => {
  console.log("/topic/index/"+id)
  if (id) {
    await router.push({ path: `/topic/index/${id}` });
  } else {
    await router.push({ path: '/topic/index' });
  }
};

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state);
</script>
