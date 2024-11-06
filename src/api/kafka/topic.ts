import service from "@/utils/request";

export const deleteTopic = (data: any) => {
  return service.post("/kafka/topic/deleteTopic", data);
};

