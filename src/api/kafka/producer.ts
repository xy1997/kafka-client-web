import service from "@/utils/request";

export const sendMessageApi = (data: any) => {
  return service.post("/kafka/producer/sendMessage", data);
};
