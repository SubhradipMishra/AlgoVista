import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import CertificateModel from "./certificate.model";


export const generateCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roadmapId, roadmapName, userName, theme = "blue" } = req.body as {
      userId: string;
      roadmapId: string;
      roadmapName: string;
      userName: string;
      theme?: "blue" | "gold" | "dark";
    };

    if (!userId || !roadmapId || !roadmapName || !userName) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

 
    const themes = {
      blue: {
        accent: "#2563eb",
        text: "#111827",
        subText: "#374151",
        background: "#f8fafc",
      },
      gold: {
        accent: "#d97706",
        text: "#1c1917",
        subText: "#57534e",
        background: "#fef9c3",
      },
      dark: {
        accent: "#facc15",
        text: "#f8fafc",
        subText: "#e5e7eb",
        background: "#0f172a",
      },
    };
    const selectedTheme = themes[theme] || themes.blue;


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

  
    doc.rect(0, 0, width, height).fill(selectedTheme.background);
    doc
      .lineWidth(4)
      .strokeColor(selectedTheme.accent)
      .rect(20, 20, width - 40, height - 40)
      .stroke();

   
    doc
      .fillColor(selectedTheme.text)
      .font("Helvetica-Bold")
      .fontSize(34)
      .text("ALGO VISTA", 0, 70, { align: "center" });

    doc
      .fillColor(selectedTheme.accent)
      .fontSize(22)
      .text("Certificate of Achievement", 0, 120, { align: "center" });

    // === Congratulations line ===
    doc
      .fillColor(selectedTheme.accent)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Congratulations!", 0, 165, { align: "center" });

    // === Recipient name ===
    doc
      .fillColor(selectedTheme.text)
      .font("Helvetica-Bold")
      .fontSize(36)
      .text(userName, 0, 200, { align: "center" });

    // === Message ===
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor(selectedTheme.subText)
      .text(
        `for successfully completing the "${roadmapName}" roadmap on AlgoVista — demonstrating outstanding learning commitment, perseverance, and excellence in technology.`,
        100,
        260,
        { width: width - 200, align: "center" }
      );

    doc
      .font("Helvetica-Oblique")
      .fontSize(12)
      .fillColor(selectedTheme.subText)
      .text(
        "We proudly recognize your hard work and wish you great success in all your future endeavors.",
        100,
        315,
        { width: width - 200, align: "center" }
      );

    // === QR Code ===
    doc.image(qrCodeData, width / 2 - 40, 370, { width: 80 });
    doc
      .fontSize(10)
      .fillColor(selectedTheme.subText)
      .text("Scan to verify certificate", 0, 460, { align: "center" });

    // === Signature Section ===
    const sigY = 420;
    const sigWidth = 200;

    // Signature Lines
    doc
      .moveTo(180, sigY + 40)
      .lineTo(180 + sigWidth, sigY + 40)
      .strokeColor(selectedTheme.subText)
      .stroke();

    doc
      .moveTo(520, sigY + 40)
      .lineTo(520 + sigWidth, sigY + 40)
      .strokeColor(selectedTheme.subText)
      .stroke();

    // Signature Names
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(selectedTheme.text)
      .text("Subhradip Mishra", 180, sigY + 45, { width: sigWidth, align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor(selectedTheme.subText)
      .text("Founder, AlgoVista", 180, sigY + 60, { width: sigWidth, align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(selectedTheme.text)
      .text("Soumyadip Mishra", 520, sigY + 45, { width: sigWidth, align: "center" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor(selectedTheme.subText)
      .text("CEO, AlgoVista", 520, sigY + 60, { width: sigWidth, align: "center" });

    // === Footer ===
    doc.rect(0, height - 50, width, 50).fill(selectedTheme.accent);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#fff")
      .text(`Certificate ID: ${certificateId}  |  AlgoVista © ${new Date().getFullYear()}`, 0, height - 35, {
        align: "center",
      });

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

    res.json({
      success: true,
      message: "Certificate generated successfully",
      fileUrl: newCert.fileUrl,
      certificateId,
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