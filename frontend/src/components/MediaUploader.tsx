'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, Image as ImageIcon, Mic, Video, X, CheckCircle, Loader2 } from 'lucide-react';
import { api, MediaUpload } from '../lib/api';

interface MediaUploaderProps {
  onMediaUploaded: (media: MediaUpload) => void;
  onClearMedia: () => void;
  selectedMedia: MediaUpload | null;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaUploaded,
  onClearMedia,
  selectedMedia
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const media = await api.uploadMedia(file);
      onMediaUploaded(media);
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload media file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startAudioRecording = async () => {
    setUploadError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `car_audio_${Date.now()}.webm`, { type: 'audio/webm' });
        
        setIsUploading(true);
        try {
          const media = await api.uploadMedia(audioFile);
          onMediaUploaded(media);
        } catch (err: any) {
          setUploadError('Failed to upload recorded audio.');
        } finally {
          setIsUploading(false);
        }
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setUploadError('Microphone permission denied or audio recording not supported.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="text-xs text-red-400 bg-red-950/60 border border-red-800 px-3 py-1.5 rounded flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Media Preview Badge */}
      {selectedMedia && (
        <div className="flex items-center gap-2 bg-slate-800 border border-sky-600/40 text-sky-200 px-3 py-1.5 rounded-lg text-xs w-fit">
          <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium capitalize">{selectedMedia.file_type}:</span>
          <span className="truncate max-w-[150px]">{selectedMedia.original_name || 'Attachment'}</span>
          <button
            type="button"
            onClick={onClearMedia}
            className="text-slate-400 hover:text-slate-200 ml-1"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-1.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,audio/*,video/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRecording}
          className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          title="Upload image, audio or video"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-sky-400" /> : <Paperclip className="w-5 h-5" />}
        </button>

        {isRecording ? (
          <button
            type="button"
            onClick={stopAudioRecording}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1.5 rounded-lg animate-pulse"
            title="Stop recording audio"
          >
            <Mic className="w-4 h-4" />
            <span>Stop Recording</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startAudioRecording}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Record vehicle noise audio"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
