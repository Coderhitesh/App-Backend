const cloudinary = require('cloudinary').v2;
require('dotenv').config()

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    cloud_name: process.env.CLOUD_NAME
});

const uploadPDF = async (file) => {
    try {
        const pdf = await cloudinary.uploader.upload(file, {
            folder: 'artists'
        })
        return { pdf: pdf.secure_url, public_id: pdf.public_id }
    } catch (error) {
        console.error(error)
        throw new Error('Failed to upload PDF');
    }
}

const uploadPDFTwo = async (file) => {
    try {
        const pdf = await cloudinary.uploader.upload(file)
        return pdf.secure_url
    } catch (error) {
        console.log(error)
    }
}

const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "artists"
        });
        return { image: result.secure_url, public_id: result.public_id };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to upload Image');
    }
};

const uploadVideo = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "artists",
            resource_type: "video"
        });
        return result.secure_url;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to upload video');
    }
};

const deleteImageFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log("Image Deleted");
    } catch (error) {
        console.error("Error deleting Image from Cloudinary", error);
        throw new Error('Failed to delete Image from Cloudinary');
    }
};

const deletePdfFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log('Image Deleted')
    } catch (error) {
        console.error('Error in deleting PDF from Cloudinary', error)
        throw new Error('Failed to delete Pdf fron the Cloudinary')
    }
}

// Upload Voice Note to Cloudinary
const uploadVoiceNote = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "voice-notes",      // Store in a separate folder for voice notes
            resource_type: "video"      // Cloudinary treats audio files as "video" resource type
        });
        return { url: result.secure_url, public_id: result.public_id }; // Return URL and public_id
    } catch (error) {
        console.error(error);
        throw new Error('Failed to upload voice note');
    }
};

// Delete Voice Note from Cloudinary
const deleteVoiceNoteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log("Voice note deleted");
    } catch (error) {
        console.error("Error deleting voice note from Cloudinary", error);
        throw new Error('Failed to delete voice note from Cloudinary');
    }
};

// const uploadPDF = async (filePath) => {
//     try {
//         const result = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'raw', // Important: Specify that the resource is raw (for non-image files)
//             eager: [{ width: 300, height: 300, crop: 'fit' }]
//         });
//         return {
//             pdf: result.secure_url, // URL to access the PDF
//             public_id: result.public_id
//         };
//     } catch (error) {
//         throw new Error('Failed to upload PDF: ' + error.message);
//     }
// };

module.exports = {
    uploadImage, uploadVideo, uploadVoiceNote, deleteVoiceNoteFromCloudinary, deleteImageFromCloudinary, uploadPDF, deletePdfFromCloudinary, uploadPDFTwo
};