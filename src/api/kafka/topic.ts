import service from "@/utils/request";

export const deleteTopic = (data: any) => {
  return service.post("/kafka/topic/deleteTopic", data);
};

export const describeTopics = (brokerId: any, topicName: any) => {
  console.log("brokerId: " + brokerId);
  console.log("topicName: " + topicName);
  return service.get("/kafka/topic/describeTopics", {
    params: {
      brokerId: brokerId,
      topicName: topicName
    }
  });
};

export const createTopic = (data: any) => {
  return service.post("/kafka/topic/createTopic", data);
};

export const loadTopic = (brokerId: any) => {
  return service.get("/kafka/topic/loadTopic?brokerId=" + brokerId);
};

export const loadPartition = (brokerId: any, topicName: any) => {
  return service.get("/kafka/topic/loadPartition?brokerId=" + brokerId + "&topicName=" + topicName);
};

export const createPartitions = (data: any) => {
  return service.post("/kafka/topic/createPartitions", data);
};

export const createReplications = (data: any) => {
  return service.post("/kafka/topic/alterPartitionReassignments", data);
};
