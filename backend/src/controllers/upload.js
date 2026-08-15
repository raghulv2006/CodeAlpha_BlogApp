const fs = require('fs');
const path = require('path');
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

const uploadsDir = path.join(__dirname, '../../public/uploads');

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { mimetype, size, buffer, originalname } = req.file;

    // Security Check: Mimetype Whitelist (Header based)
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, and WEBM formats are permitted.',
      });
    }

    // Security Check: Magic Bytes Verification
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
      return res.status(400).json({
        message: 'Invalid file content. File failed magic byte verification.',
      });
    }

    const isVideo = type.mime.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const maxAllowedSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    // Security Check: File Size Limit
    if (size > maxAllowedSize) {
      return res.status(400).json({
        message: `File exceeds maximum allowed limit of ${isVideo ? '50MB' : '10MB'}.`,
      });
    }

    try {
      // Stream buffer directly to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'botblogs_media',
            resource_type: isVideo ? 'video' : 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      console.log(`Cloudinary ${resourceType} upload successful:`, uploadResult.secure_url);

      return res.status(200).json({
        url: uploadResult.secure_url,
        mediaType: resourceType,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
      });
    } catch (cloudErr) {
      console.error('Cloudinary upload error:', cloudErr.message || cloudErr);

      // Local fallback storage in case Cloudinary credentials need updating
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const SAFE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.mov'];
      let rawExt = path.extname(originalname || '').toLowerCase();
      if (!SAFE_EXTENSIONS.includes(rawExt)) {
        rawExt = isVideo ? '.mp4' : '.jpg';
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${rawExt}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);

      const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
      const localUrl = `${baseUrl}/uploads/${fileName}`;

      return res.status(200).json({
        url: localUrl,
        mediaType: resourceType,
        publicId: fileName,
        notice: 'Media saved via alternate storage',
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Media upload failed' });
  }
};

module.exports = { uploadMedia };
