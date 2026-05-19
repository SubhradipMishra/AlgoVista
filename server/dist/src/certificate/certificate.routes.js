"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_controller_1 = require("./certificate.controller");
const gaurd_middleware_1 = require("../middleware/gaurd.middleware");
const CertificateRouter = express_1.default.Router();
CertificateRouter.post("/generate", certificate_controller_1.generateCertificate);
CertificateRouter.get("/download/:certificateId", certificate_controller_1.downloadCertificate);
CertificateRouter.get("/file/:certificateId", certificate_controller_1.viewCertificate);
CertificateRouter.get("/byUser", gaurd_middleware_1.AdminUserSuperAdminGuard, certificate_controller_1.fetchCertificateByUser);
exports.default = CertificateRouter;
