import service from "@/utils/request";


export const describeConfigs = (data: any) => {
  return service.post("/kafka/config/describeConfigs", data);
};

export const incrementalAlterConfigs = (data: any) => {
  return service.post("/kafka/config/incrementalAlterConfigs", data);
};