"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCertificateByUser = exports.viewCertificate = exports.downloadCertificate = exports.generateCertificate = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const certificate_model_1 = __importDefault(require("./certificate.model"));
const generateCertificate = async (req, res) => {
    try {
        const { userId, roadmapId, roadmapName, userName } = req.body;
        if (!userId || !roadmapId || !roadmapName || !userName) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }
        // === Monotone Theme (Black/White/Gray) ===
        const selectedTheme = {
            accent: "#000000",
            text: "#111111",
            subText: "#444444",
            background: "#f7f7f7",
            border: "#222222",
        };
        const existingCert = await certificate_model_1.default.findOne({ userId, roadmapId });
        if (existingCert) {
            res.json({
                success: true,
                message: "Certificate already exists",
                fileUrl: existingCert.fileUrl,
                certificateId: existingCert.certificateId,
            });
            return;
        }
        const certificateId = `ALGO-${Date.now()}`;
        const uploadFolder = path_1.default.join(__dirname, "../../uploads/certificates");
        if (!fs_1.default.existsSync(uploadFolder))
            fs_1.default.mkdirSync(uploadFolder, { recursive: true });
        const pdfPath = path_1.default.join(uploadFolder, `${certificateId}.pdf`);
        const verifyUrl = `https://algovista.com/verify/${certificateId}`;
        const qrCodeData = await qrcode_1.default.toDataURL(verifyUrl);
        const doc = new pdfkit_1.default({
            size: "A4",
            layout: "landscape",
            margin: 40,
        });
        const stream = fs_1.default.createWriteStream(pdfPath);
        doc.pipe(stream);
        const width = doc.page.width;
        const height = doc.page.height;
        /* ──────────────────────────────────────────
            BACKGROUND + MODERN BORDER
        ───────────────────────────────────────────*/
        doc.rect(0, 0, width, height).fill(selectedTheme.background);
        doc
            .lineWidth(6)
            .strokeColor(selectedTheme.border)
            .rect(30, 30, width - 60, height - 60)
            .stroke();
        /* ──────────────────────────────────────────
            TITLE BRANDING
        ───────────────────────────────────────────*/
        doc
            .fillColor(selectedTheme.text)
            .font("Helvetica-Bold")
            .fontSize(42)
            .text("ALGO VISTA", 0, 70, { align: "center", characterSpacing: 1.5 });
        doc
            .moveTo(width * 0.32, 130)
            .lineTo(width * 0.68, 130)
            .strokeColor(selectedTheme.accent)
            .lineWidth(2)
            .stroke();
        doc
            .fillColor(selectedTheme.text)
            .font("Helvetica-Bold")
            .fontSize(30)
            .text("Certificate of Achievement", 0, 145, { align: "center" });
        /* ──────────────────────────────────────────
            RECEIVER NAME
        ───────────────────────────────────────────*/
        doc
            .fillColor(selectedTheme.accent)
            .font("Helvetica")
            .fontSize(18)
            .text("Awarded To", 0, 190, { align: "center" });
        doc
            .fillColor(selectedTheme.text)
            .font("Helvetica-Bold")
            .fontSize(38)
            .text(userName, 0, 225, { align: "center" });
        /* ──────────────────────────────────────────
             MESSAGE
        ───────────────────────────────────────────*/
        doc
            .font("Helvetica")
            .fontSize(14)
            .fillColor(selectedTheme.subText)
            .text(`for successfully completing the "${roadmapName}" roadmap — showcasing dedication and excellence in technology learning.`, 120, 285, { width: width - 240, align: "center" });
        doc
            .font("Helvetica-Oblique")
            .fontSize(12)
            .fillColor(selectedTheme.subText)
            .text("We proudly recognize your efforts and wish you great success in your tech journey.", 120, 325, { width: width - 240, align: "center" });
        /* ──────────────────────────────────────────
            QR VERIFICATION
        ───────────────────────────────────────────*/
        doc.image(qrCodeData, width / 2 - 45, 365, { width: 90 });
        doc
            .fontSize(10)
            .fillColor(selectedTheme.subText)
            .text("Scan to Verify", 0, 455, { align: "center" });
        /* ──────────────────────────────────────────
            SIGNATURES
        ───────────────────────────────────────────*/
        const sigY = 400;
        const sigWidth = 220;
        // Subhradip
        doc
            .strokeColor(selectedTheme.subText)
            .moveTo(width * 0.24, sigY + 50)
            .lineTo(width * 0.24 + sigWidth, sigY + 50)
            .stroke();
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor(selectedTheme.text)
            .text("Subhradip Mishra", width * 0.24, sigY + 55, { width: sigWidth, align: "center" })
            .font("Helvetica")
            .fontSize(10)
            .fillColor(selectedTheme.subText)
            .text("Founder, AlgoVista", width * 0.24, sigY + 70, { width: sigWidth, align: "center" });
        // Soumyadip
        doc
            .strokeColor(selectedTheme.subText)
            .moveTo(width * 0.60, sigY + 50)
            .lineTo(width * 0.60 + sigWidth, sigY + 50)
            .stroke();
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor(selectedTheme.text)
            .text("Soumyadip Mishra", width * 0.60, sigY + 55, { width: sigWidth, align: "center" })
            .font("Helvetica")
            .fontSize(10)
            .fillColor(selectedTheme.subText)
            .text("CEO, AlgoVista", width * 0.60, sigY + 70, { width: sigWidth, align: "center" });
        /* ──────────────────────────────────────────
            FOOTER BAR
        ───────────────────────────────────────────*/
        doc.rect(0, height - 40, width, 40).fill(selectedTheme.text);
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#ffffff")
            .text(`Certificate ID: ${certificateId}  |  AlgoVista © ${new Date().getFullYear()}`, 0, height - 28, { align: "center" });
        doc.end();
        await new Promise((resolve) => stream.on("finish", resolve));
        // Save to DB
        const newCert = new certificate_model_1.default({
            userId,
            roadmapId,
            roadmapName,
            certificateId,
            fileUrl: `/certificate/file/${certificateId}`,
        });
        await newCert.save();
        res.json({
            success: true,
            message: "Certificate generated successfully",
            fileUrl: newCert.fileUrl,
            certificateId,
        });
    }
    catch (error) {
        console.error("Certificate generation failed:", error);
        res.status(500).json({ success: false, message: "Failed to generate certificate" });
    }
};
exports.generateCertificate = generateCertificate;
/**
 * 📥 Download Certificate
 */
const downloadCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const filePath = path_1.default.join(__dirname, "../../uploads/certificates", `${certificateId}.pdf`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: "Certificate not found" });
            return;
        }
        res.download(filePath, `${certificateId}.pdf`);
    }
    catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ success: false, message: "Failed to download certificate" });
    }
};
exports.downloadCertificate = downloadCertificate;
/**
 * 👁️ View Certificate (PDF Stream)
 */
const viewCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const filePath = path_1.default.join(__dirname, "../../uploads/certificates", `${certificateId}.pdf`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: "Certificate not found" });
            return;
        }
        res.setHeader("Content-Type", "application/pdf");
        fs_1.default.createReadStream(filePath).pipe(res);
    }
    catch (error) {
        console.error("View error:", error);
        res.status(500).json({ success: false, message: "Failed to view certificate" });
    }
};
exports.viewCertificate = viewCertificate;
const fetchCertificateByUser = async (req, res) => {
    try {
        const certificates = await certificate_model_1.default.find({ userId: req.user.id });
        console.log(certificates);
        return res.status(200).json({ certificate: certificates });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};
exports.fetchCertificateByUser = fetchCertificateByUser;
