const cloudinary = require('../utils/cloudinary');

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { mimetype, size, buffer } = req.file;

    // Security Check: Mimetype Whitelist
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, and WEBM formats are permitted.',
      });
    }

    const isVideo = mimetype.startsWith('video/');
    const maxAllowedSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    // Security Check: File Size Limit
    if (size > maxAllowedSize) {
      return res.status(400).json({
        message: `File exceeds maximum allowed limit of ${isVideo ? '50MB' : '10MB'}.`,
      });
    }

    const resourceType = isVideo ? 'video' : 'image';

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'botblogs',
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return res.status(200).json({
      url: uploadResult.secure_url,
      mediaType: resourceType,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: 'Media upload failed' });
  }
};

module.exports = { uploadMedia };
