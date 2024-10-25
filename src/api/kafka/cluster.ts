import service from "@/utils/request";

export const addCluster = (data: any) => {
  return service.post("/kafka/broker/add", data);
};

export const describeCluster = (data: any) => {
  return service.get("/kafka/broker/describeCluster?brokerId="+data);
};

export const update = (data: any) => {
  return service.post("/kafka/broker/update", data);
};

export const detail = (data: any) => {
  return service.get("/kafka/broker/detail?id=" + data);
};
