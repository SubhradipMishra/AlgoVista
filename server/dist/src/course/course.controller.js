"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.fetchCourse = exports.fetchCourses = exports.createCourse = void 0;
const course_model_1 = __importDefault(require("./course.model"));
const cloudinary_1 = __importDefault(require("../../utils/cloudinary"));
const fs_1 = __importDefault(require("fs"));
/* Upload Video to Cloudinary */
const uploadVideoToCloudinary = async (filePath) => {
    const result = await cloudinary_1.default.uploader.upload(filePath, {
        folder: "courses/videos",
        resource_type: "video",
    });
    fs_1.default.unlink(filePath, () => { });
    return result.secure_url;
};
const createCourse = async (req, res) => {
    console.log('hit');
    try {
        const { title, description, duration, instructor, difficultyLevel, courseType, price, discountPrice, tags, prerequisits, outCome, category, language, modules, certificateAvailable, } = req.body;
        let parsedModules = modules ? JSON.parse(modules) : [];
        let parsedTags = tags ? JSON.parse(tags) : [];
        let parsedPrerequisits = prerequisits ? JSON.parse(prerequisits) : [];
        let parsedOutCome = outCome ? JSON.parse(outCome) : [];
        let thumbnail = null;
        let roadmapImage = null;
        // Handle Multer uploaded files
        for (const file of req.files) {
            const { fieldname, path: filePath, filename } = file;
            if (fieldname === "thumbnail") {
                thumbnail = `http://localhost:4000/uploads/courses/${filename}`;
                continue;
            }
            if (fieldname === "roadmapImage") {
                roadmapImage = `http://localhost:4000/uploads/courses/${filename}`;
                continue;
            }
            /* Video & PDF Uploads: video_0_0 | pdf_1_2 format */
            const [type, moduleIndex, subIndex] = fieldname.split("_");
            const target = parsedModules[moduleIndex]?.submodules[subIndex];
            if (!target)
                continue;
            if (type === "video") {
                target.videoUrl = await uploadVideoToCloudinary(filePath);
            }
            if (type === "pdf") {
                target.pdfUrl = `http://localhost:4000/uploads/courses/${filename}`;
            }
        }
        const course = await course_model_1.default.create({
            title,
            description,
            duration,
            instructor,
            difficultyLevel,
            courseType,
            price: Number(price) || 0,
            discountPrice: Number(discountPrice) || 0,
            tags: parsedTags,
            prerequisits: parsedPrerequisits,
            outCome: parsedOutCome,
            category,
            language,
            modules: parsedModules,
            certificateAvailable: Boolean(certificateAvailable) || false,
            thumbnail,
            roadmapImage,
            createdBy: req.user.id,
            status: "draft",
            isPublished: false,
            rating: 0,
            numReviews: 0,
            views: 0,
        });
        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCourse = createCourse;
/* Fetch All Courses */
const fetchCourses = async (_req, res) => {
    const courses = await course_model_1.default.find().sort({ createdAt: -1 });
    res.json({ success: true, courses });
};
exports.fetchCourses = fetchCourses;
/* Fetch Single Course */
const fetchCourse = async (req, res) => {
    const course = await course_model_1.default.findById(req.params.id);
    if (!course)
        return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
};
exports.fetchCourse = fetchCourse;
/* Delete Course */
const deleteCourse = async (req, res) => {
    const deleted = await course_model_1.default.findByIdAndDelete(req.params.id);
    if (!deleted)
        return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deleted successfully" });
};
exports.deleteCourse = deleteCourse;
/* Update Course */
// export const updateCourse = async (req: any, res: Response) => {
//   try {
//     const course = await CourseModel.findById(req.params.id);
//     if (!course) return res.status(404).json({ success: false, message: "Course not found" });
//     const {
//       title, description, duration, instructor, difficultyLevel,
//       courseType, price, discountPrice, tags, prerequisits,
//       outCome, category, language, modules, certificateAvailable,
//       status, isPublished
//     } = req.body;
//     Object.assign(course, {
//       ...(title && { title }),
//       ...(description && { description }),
//       ...(duration && { duration }),
//       ...(instructor && { instructor }),
//       ...(difficultyLevel && { difficultyLevel }),
//       ...(courseType && { courseType }),
//       ...(category && { category }),
//       ...(language && { language }),
//       ...(price && { price: Number(price) }),
//       ...(discountPrice && { discountPrice: Number(discountPrice) }),
//       ...(tags && { tags: parseJSON(tags) }),
//       ...(prerequisits && { prerequisits: parseJSON(prerequisits) }),
//       ...(outCome && { outCome: parseJSON(outCome) }),
//       ...(modules && { modules: parseJSON(modules) }),
//       ...(certificateAvailable !== undefined && { certificateAvailable: certificateAvailable === "true" }),
//       ...(status && { status }),
//       ...(isPublished !== undefined && { isPublished: isPublished === "true" }),
//     });
//     if (req.files && Array.isArray(req.files)) {
//       for (const file of req.files as Express.Multer.File[]) {
//         const { fieldname, path: filePath, filename } = file;
//         if (fieldname === "thumbnail") {
//           course.thumbnail = `http://localhost:4000/uploads/courses/${filename}`;
//           continue;
//         }
//         if (fieldname === "roadmapImage") {
//           course.roadmapImage = `http://localhost:4000/uploads/courses/${filename}`;
//           continue;
//         }
//         const [type, moduleIndex, subIndex] = fieldname.split("_");
//         const target = course.modules?.[moduleIndex]?.submodules?.[subIndex];
//         if (!target) continue;
//         if (type === "video") {
//           target.videoUrl = await uploadVideoToCloudinary(filePath);
//         }
//         if (type === "pdf") {
//           target.pdfUrl = `http://localhost:4000/uploads/courses/${filename}`;
//         }
//       }
//     }
//     await course.save();
//     res.json({ success: true, message: "Course updated successfully", course });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
