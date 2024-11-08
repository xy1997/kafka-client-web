import service from "@/utils/request";


export const listConsumerGroups = (brokerId: any) => {
  return service.get("/kafka/consumer/listConsumerGroups?brokerId=" + brokerId);
};

export const listTopicInfoOfConsumer = (brokerId: any, groupId: any) => {
  return service.get("/kafka/consumer/listTopicInfoOfConsumer", {
    params: {
      brokerId: brokerId,
      groupId: groupId
    }
  });
};