import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import axiosClient from '../api/axiosClient.js';

function VideoUpload({ problemId, onVideoSaved }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('Video file size must be less than 500MB');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      console.log('=== Video Upload Process Started ===');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      console.log('Problem ID:', problemId);
      console.log('Form data:', formData);

      console.log('[Step 1] Requesting upload token from backend...');
      const tokenResponse = await axiosClient.post('/videos/upload-token', {
        problemId,
      });
      console.log('[Step 1] Token response received:', tokenResponse.data);

      const { uploadPreset, folder, cloudName } = tokenResponse.data;

      if (!uploadPreset) {
        console.error('[Error] Upload preset missing]');
        throw new Error('Upload preset not configured. Please set CLOUDINARY_UPLOAD_PRESET in backend .env');
      }

      const finalCloudName = cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      
      console.log('Cloud name sources:', {
        fromBackend: cloudName,
        fromEnv: envCloudName,
        final: finalCloudName
      });
      
      if (!finalCloudName) {
        console.error('[Error] Cloud name not configured');
        console.error('Backend cloudName:', cloudName);
        console.error('Frontend env VITE_CLOUDINARY_CLOUD_NAME:', envCloudName);
        throw new Error('Cloudinary cloud name not configured. Please set CLOUDINARY_CLOUD_NAME in backend .env or VITE_CLOUDINARY_CLOUD_NAME in frontend_admin/.env');
      }
      
      if (finalCloudName === 'configured' || finalCloudName === 'undefined' || finalCloudName === 'null') {
        console.error('[Error] Invalid cloud name value:', finalCloudName);
        throw new Error(`Invalid cloud name: "${finalCloudName}". Please set a valid CLOUDINARY_CLOUD_NAME in backend .env (should be your actual cloud name like "dt2qgf2y7")`);
      }

      console.log('Upload configuration:', {
        uploadPreset,
        folder,
        cloudName: finalCloudName,
        resourceType: 'video'
      });

      console.log('[Step 2] Preparing FormData for Cloudinary upload...');
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', uploadPreset);
      if (folder) {
      cloudinaryFormData.append('folder', folder);
      }
      cloudinaryFormData.append('resource_type', 'video');

      console.log('[Step 2] Uploading to Cloudinary...');
      console.log('Upload URL:', `https://api.cloudinary.com/v1_1/${finalCloudName}/video/upload`);
      console.log('FormData entries:', {
        file: file.name,
        upload_preset: uploadPreset,
        folder: folder || 'none',
        resource_type: 'video'
      });

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      });

      const cloudinaryResponse = await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              ok: true,
              status: xhr.status,
              statusText: xhr.statusText,
              json: async () => JSON.parse(xhr.responseText),
              headers: new Headers()
            });
          } else {
            reject({
              ok: false,
              status: xhr.status,
              statusText: xhr.statusText,
              json: async () => JSON.parse(xhr.responseText).catch(() => ({ error: { message: 'Unknown error' } })),
              headers: new Headers()
            });
          }
        });

        xhr.addEventListener('error', () => {
          reject({
            ok: false,
            status: 0,
            statusText: 'Network Error',
            json: async () => ({ error: { message: 'Network error occurred' } }),
            headers: new Headers()
          });
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${finalCloudName}/video/upload`);
        xhr.send(cloudinaryFormData);
      });

      console.log('[Step 2] Cloudinary response status:', cloudinaryResponse.status, cloudinaryResponse.statusText);
      console.log('[Step 2] Cloudinary response headers:', Object.fromEntries(cloudinaryResponse.headers.entries()));

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('[Step 2] Cloudinary upload error details:', {
          status: cloudinaryResponse.status,
          statusText: cloudinaryResponse.statusText,
          errorData: errorData
        });
        
        let errorMessage = errorData.error?.message || `Cloudinary upload failed: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText}`;
        const errorMessageLower = errorMessage.toLowerCase();
        const errorDataStr = JSON.stringify(errorData).toLowerCase();
        
        if (errorMessageLower.includes('signature') || errorMessageLower.includes('api_key') || 
            errorMessageLower.includes('api key') || errorDataStr.includes('signature') || 
            errorDataStr.includes('api_key') || errorDataStr.includes('authentication')) {
          errorMessage = `Upload preset "${uploadPreset}" is configured as "Signed" but needs to be "Unsigned". See console for fix instructions.`;
          console.error('=== UPLOAD PRESET CONFIGURATION ERROR ===');
          console.error('The upload preset exists but is set to "Signed" mode.');
          console.error('For direct frontend uploads, the preset MUST be set to "Unsigned" mode.');
          console.error('');
          console.error('To fix this:');
          console.error('1. Go to https://cloudinary.com/console');
          console.error('2. Navigate to Settings → Upload');
          console.error(`3. Find preset "${uploadPreset}" and click "Edit"`);
          console.error('4. Change "Signing mode" from "Signed" to "Unsigned" ⚠️ CRITICAL');
          console.error('5. Make sure "Resource type" is set to "Video"');
          console.error('6. Click "Save"');
          console.error('7. Try uploading again');
          console.error('');
          console.error('Note: Unsigned presets allow direct uploads from frontend without API keys.');
        } else if (errorMessageLower.includes('preset') || errorMessageLower.includes('not found')) {
          errorMessage = `Upload preset "${uploadPreset}" not found in Cloudinary. Please create it in your Cloudinary dashboard. See console for setup instructions.`;
          console.error('=== UPLOAD PRESET SETUP REQUIRED ===');
          console.error('The upload preset does not exist in your Cloudinary account.');
          console.error('To fix this:');
          console.error('1. Go to https://cloudinary.com/console');
          console.error('2. Navigate to Settings → Upload');
          console.error('3. Click "Add upload preset"');
          console.error(`4. Set preset name to: "${uploadPreset}"`);
          console.error('5. Set "Signing mode" to "Unsigned" ⚠️ CRITICAL');
          console.error('6. Set "Resource type" to "Video"');
          console.error('7. Set "Max file size" to 500MB (or your preferred limit)');
          console.error('8. Save the preset');
          console.error('9. Make sure CLOUDINARY_UPLOAD_PRESET in backend/.env matches the preset name');
        }
        
        throw new Error(errorMessage);
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log('[Step 2] Cloudinary upload successful!', {
        public_id: cloudinaryData.public_id,
        secure_url: cloudinaryData.secure_url,
        duration: cloudinaryData.duration,
        bytes: cloudinaryData.bytes
      });

      console.log('[Step 3] Saving video metadata to backend...');
      const savePayload = {
        problemId,
        title: formData.title,
        description: formData.description,
        cloudinaryVideoId: cloudinaryData.public_id,
        cloudinaryUrl: cloudinaryData.secure_url,
        thumbnailUrl: cloudinaryData.thumbnail_url || '',
        duration: cloudinaryData.duration || 0,
      };
      console.log('[Step 3] Save payload:', savePayload);

      const saveResponse = await axiosClient.post('/videos/save', savePayload);
      console.log('[Step 3] Video metadata saved successfully!', saveResponse.data);

      setSuccess('Video uploaded successfully!');
      setFormData({ title: '', description: '' });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (e && e.target) {
        e.target.value = '';
      }

      console.log('=== Video Upload Process Completed Successfully ===');

      if (onVideoSaved) {
        onVideoSaved(saveResponse.data.video);
      }
    } catch (err) {
      console.error('=== Video Upload Process Failed ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
        console.error('Error response headers:', err.response.headers);
      }
      setError(err.response?.data?.message || err.message || 'Failed to upload video');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (e && e.target) {
        e.target.value = '';
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      console.log('Upload state reset');
    }
  };

  const handleReset = () => {
    setError('');
    setSuccess('');
    setUploadProgress(0);
    setFormData({ title: '', description: '' });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-black/40">
      <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Upload Editorial Video
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-white/70 mb-1">Video Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Two Sum Solution Explanation"
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-xs text-white/70 mb-1">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of the video content..."
            rows={2}
            className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-xs text-white/70 mb-1">Video File *</label>
          <label className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-4 transition-all ${
            uploading 
              ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' 
              : 'border-white/20 hover:border-blue-500/50 cursor-pointer'
          } ${uploading ? 'animate-pulse' : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <div className="text-center">
              {uploading ? (
                <div className="space-y-2">
                  <Upload className="w-6 h-6 mx-auto text-blue-500" />
                  <p className="text-xs text-white/70">Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 mx-auto text-white/50" />
                  <p className="text-xs text-white/70">Click to select video</p>
                  <p className="text-xs text-white/50">Max 500MB</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            {success}
          </div>
        )}

        {uploading && (
          <div className="text-xs text-blue-400 text-center">
            Uploading... Please wait
          </div>
        )}

        {(error || formData.title || formData.description) && !uploading && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full mt-2 px-3 py-2 text-xs border border-white/15 rounded-lg hover:bg-white/10 transition text-white/70"
          >
            Clear Form
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoUpload;
