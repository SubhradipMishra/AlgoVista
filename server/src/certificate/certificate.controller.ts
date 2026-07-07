// @ts-nocheck
import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import CertificateModel from "./certificate.model";
import ActivityModel from "../activity/activity.model";
import { syncUserGamification } from "../user/user.gamification";


export const generateCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roadmapId, roadmapName, userName } = req.body as {
      userId: string;
      roadmapId: string;
      roadmapName: string;
      userName: string;
    };

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

    const existingCert = await CertificateModel.findOne({ userId, roadmapId });
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
    const uploadFolder = path.join(__dirname, "../../uploads/certificates");
    if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

    const pdfPath = path.join(uploadFolder, `${certificateId}.pdf`);
    const verifyUrl = `https://algovista.com/verify/${certificateId}`;
    const qrCodeData = await QRCode.toDataURL(verifyUrl);

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });
    const stream = fs.createWriteStream(pdfPath);
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
      .text(
        `for successfully completing the "${roadmapName}" roadmap — showcasing dedication and excellence in technology learning.`,
        120,
        285,
        { width: width - 240, align: "center" }
      );

    doc
      .font("Helvetica-Oblique")
      .fontSize(12)
      .fillColor(selectedTheme.subText)
      .text(
        "We proudly recognize your efforts and wish you great success in your tech journey.",
        120,
        325,
        { width: width - 240, align: "center" }
      );

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
      .text("Subhradip Mishra", width * 0.24, sigY + 55,
        { width: sigWidth, align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor(selectedTheme.subText)
      .text("Founder, AlgoVista", width * 0.24, sigY + 70,
        { width: sigWidth, align: "center" });

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
      .text("Soumyadip Mishra", width * 0.60, sigY + 55,
        { width: sigWidth, align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor(selectedTheme.subText)
      .text("CEO, AlgoVista", width * 0.60, sigY + 70,
        { width: sigWidth, align: "center" });

    /* ──────────────────────────────────────────
        FOOTER BAR
    ───────────────────────────────────────────*/
    doc.rect(0, height - 40, width, 40).fill(selectedTheme.text);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#ffffff")
      .text(
        `Certificate ID: ${certificateId}  |  AlgoVista © ${new Date().getFullYear()}`,
        0,
        height - 28,
        { align: "center" }
      );

    doc.end();
    await new Promise<void>((resolve) => stream.on("finish", resolve));

    // Save to DB
    const newCert = new CertificateModel({
      userId,
      roadmapId,
      roadmapName,
      certificateId,
      fileUrl: `/certificate/file/${certificateId}`,
    });
    await newCert.save();

    await ActivityModel.create({
      userId,
      type: "certificate-earned",
      route: `/roadmaps/${roadmapId}`,
      data: {
        name: roadmapName,
        description: "Unlocked a verified roadmap completion certificate.",
      },
    }).catch((activityError) => {
      console.error("Certificate activity logging failed:", activityError);
    });

    const gamification = await syncUserGamification(userId);

    res.json({
      success: true,
      message: "Certificate generated successfully",
      fileUrl: newCert.fileUrl,
      certificateId,
      gamification,
    });
  } catch (error) {
    console.error("Certificate generation failed:", error);
    res.status(500).json({ success: false, message: "Failed to generate certificate" });
  }
};




/**
 * 📥 Download Certificate
 */
export const downloadCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;
    const filePath = path.join(__dirname, "../../uploads/certificates", `${certificateId}.pdf`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: "Certificate not found" });
      return;
    }

    res.download(filePath, `${certificateId}.pdf`);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Failed to download certificate" });
  }
};

/**
 * 👁️ View Certificate (PDF Stream)
 */
export const viewCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;
    const filePath = path.join(__dirname, "../../uploads/certificates", `${certificateId}.pdf`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: "Certificate not found" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("View error:", error);
    res.status(500).json({ success: false, message: "Failed to view certificate" });
  }
};



export const fetchCertificateByUser = async(req:any , res:Response)=>{
	try{

		 const certificates = await CertificateModel.find({userId:req.user.id}) ; 
		 console.log(certificates);
		 return res.status(200).json({certificate:certificates})
	}
	catch(err:any){
		console.log(err);
		return res.status(500).json(err);
	}
}
