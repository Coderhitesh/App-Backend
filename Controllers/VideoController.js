const Video = require('../Models/VideoModel')

exports.createVideo = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid url"
            })
        }
        const video = new Video({
            url
        })
        await video.save()
        res.status(201).json({
            success: true,
            message: "Video created successfully",
            data: video
        })
    } catch (error) {
        console.log("Internal server error in creating category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

exports.getAllVideo = async (req, res) => {
    try {
        const video = await Video.find();
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "No video found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Video found successfully",
            data: video
        })
    } catch (error) {
        console.log("Internal server error in creating category");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

exports.getSingleVideo = async (req, res) => {
    try {
        const videoId = req.params._id;
        const video = await Video.findById(videoId);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Video fetched successfully",
            data: video
        });
    } catch (error) {
        console.log("Internal server error in fetching video");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const videoId = req.params._id;
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid URL"
            });
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId, { url }, { new: true });

        if (!updatedVideo) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            data: updatedVideo
        });
    } catch (error) {
        console.log("Internal server error in updating video");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const videoId = req.params._id;
        const deletedVideo = await Video.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Video deleted successfully"
        });
    } catch (error) {
        console.log("Internal server error in deleting video");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
