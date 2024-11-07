import service from "@/utils/request";

export const deleteTopic = (data: any) => {
  return service.post("/kafka/topic/deleteTopic", data);
};

export const describeTopics = (brokerId: any,topicName: any) => {
  console.log("brokerId: "+ brokerId)
  console.log("topicName: "+ topicName)
  return service.get("/kafka/topic/describeTopics", {
    params: {
      brokerId: brokerId,
      topicName: topicName
    }
  });
};