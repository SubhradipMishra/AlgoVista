import express from "express";
import {
  generateCertificate,
  downloadCertificate,
  viewCertificate,
  fetchCertificateByUser,
} from "./certificate.controller";
import { Certificate } from "crypto";
import { AdminUserSuperAdminGuard } from "../middleware/gaurd.middleware";

const CertificateRouter = express.Router();

CertificateRouter.post("/generate", generateCertificate);
CertificateRouter.get("/download/:certificateId", downloadCertificate);
CertificateRouter.get("/file/:certificateId", viewCertificate);
CertificateRouter.get("/byUser",AdminUserSuperAdminGuard,fetchCertificateByUser);

export default CertificateRouter;
