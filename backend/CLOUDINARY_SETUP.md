# Cloudinary Setup Guide

## Prerequisites
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloudinary credentials from the dashboard

## Environment Variables

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=code_arena_videos
```

## Setting Up Upload Preset

1. Go to Cloudinary Dashboard → Settings → Upload
2. Click "Add upload preset"
3. Configure the preset:
   - **Preset name**: `code_arena_videos` (or match your `.env` value)
   - **Signing mode**: Select "Unsigned" (for direct frontend uploads)
   - **Folder**: `code-arena/problems` (optional, for organization)
   - **Resource type**: Video
   - **Allowed formats**: mp4, webm, mov, avi (or all video formats)
   - **Max file size**: 500MB (or your preferred limit)
   - **Transformation**: Optional video processing settings

4. Save the preset

## Install Cloudinary Package

```bash
cd backend
npm install cloudinary
```

## Frontend Environment Variables

Add to `frontend_admin/.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Testing

1. Start the backend server
2. Start the admin frontend
3. Navigate to Problems page
4. Edit an existing problem
5. Scroll to the "Upload Editorial Video" section
6. Enter a title and select a video file
7. The video will upload to Cloudinary and metadata will be saved to MongoDB

## Video Storage Structure

Videos are stored in Cloudinary with the following folder structure:
```
code-arena/
  problems/
    {problemId}/
      videos/
        {video_id}
```

## API Endpoints

- `POST /videos/upload-token` - Get upload token (admin only)
- `POST /videos/save` - Save video metadata after upload (admin only)
- `GET /videos/problem/:problemId` - Get all videos for a problem (public)
- `GET /videos/:videoId` - Get single video (public, increments views)
- `PATCH /videos/:videoId` - Update video (admin or owner)
- `DELETE /videos/:videoId` - Delete video (admin or owner, also deletes from Cloudinary)

