import axiosInstance from "../axios";

export const createCertificateAPI = async (payload: FormData, token: string | undefined) => {
  return await axiosInstance.post("/certificates", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getFarmCertificatesAPI = async (farmId: string) => {
  return await axiosInstance.get(`/certificates/farm/${farmId}`);
};

export const getPendingCertificatesAPI = async (token: string | undefined) => {
  return await axiosInstance.get("/certificates/admin/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const verifyCertificateAPI = async (certId: string, status: "APPROVED" | "REJECTED", token: string | undefined) => {
  return await axiosInstance.put(
    `/certificates/admin/${certId}/verify`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
