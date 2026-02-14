import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';

interface SendResponseResult {
  success: boolean;
  callSid?: string;
  messageSid?: string;
  to: string;
  status: string;
  message?: string;
}

interface TTSGenerateResponse {
  success: boolean;
  audioUrl: string;
  fileName: string;
  characterCount: number;
  estimatedCost: number;
}

const MessageSender: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'call'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [responseData, setResponseData] = useState<SendResponseResult | null>(null);
  
  // Voice call specific states
  const [voiceInputMethod, setVoiceInputMethod] = useState<'tts' | 'upload' | 'twiml'>('tts');
  const [voiceTTSText, setVoiceTTSText] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceUrl, setVoiceUrl] = useState('http://demo.twilio.com/docs/voice.xml');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioFile, setGeneratedAudioFile] = useState<string | null>(null);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const sendSMS = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number (e.g., +9779862478859)',
        variant: 'destructive',
      });
      return;
    }

    if (!messageContent.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message to send',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toNumber: phoneNumber,
          message: messageContent,
        }),
      });

      const data = (await response.json()) as SendResponseResult;

      if (data.success) {
        setResponseData(data);
        toast({
          title: 'SMS sent successfully',
          description: `Message SID: ${data.messageSid}`,
        });
        setMessageContent('');
      } else {
        toast({
          title: 'Failed to send SMS',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send SMS',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const makeVoiceCall = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number (e.g., +9779862478859)',
        variant: 'destructive',
      });
      return;
    }

    let twimlUrl: string | null = null;

    if (voiceInputMethod === 'tts') {
      if (!generatedAudioUrl) {
        toast({
          title: 'No audio generated',
          description: 'Please generate audio from text first',
          variant: 'destructive',
        });
        return;
      }
      // Use generated audio URL as TwiML
      twimlUrl = generatedAudioUrl;
    } else if (voiceInputMethod === 'upload') {
      if (!voiceFile) {
        toast({
          title: 'No voice file',
          description: 'Please upload a voice file',
          variant: 'destructive',
        });
        return;
      }
      // Upload file and get URL
      twimlUrl = await uploadVoiceFile(voiceFile);
    } else {
      if (!voiceUrl.trim()) {
        toast({
          title: 'Invalid TwiML URL',
          description: 'Please enter a valid TwiML URL',
          variant: 'destructive',
        });
        return;
      }
      twimlUrl = voiceUrl;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toNumber: phoneNumber,
          twimlUrl: twimlUrl,
        }),
      });

      const data = (await response.json()) as SendResponseResult;

      if (data.success) {
        setResponseData(data);
        toast({
          title: 'Voice call initiated',
          description: `Call SID: ${data.callSid}`,
        });
      } else {
        toast({
          title: 'Failed to initiate call',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to make voice call',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file (MP3, WAV, OGG, or WebM)',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Voice file must be under 10MB',
          variant: 'destructive',
        });
        return;
      }

      setVoiceFile(file);
      setGeneratedAudioUrl(null);
      toast({
        title: 'File uploaded',
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }
  };

  const uploadVoiceFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/upload-voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload voice file');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      throw new Error(
        `Voice file upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const generateSpeechFromText = async () => {
    if (!voiceTTSText.trim()) {
      toast({
        title: 'Empty text',
        description: 'Please enter text to generate speech',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTtsProgress(0);

    try {
      // Validate text first
      setTtsProgress(10);
      const validateResponse = await fetch(`${API_BASE_URL}/api/tts/validate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceTTSText }),
      });

      const validateData = await validateResponse.json();

      if (!validateData.valid) {
        toast({
          title: 'Invalid text',
          description: validateData.errors.join(', '),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setCharacterCount(validateData.characterCount);
      setEstimatedCost(validateData.estimatedCost);

      // Generate speech
      setTtsProgress(50);
      const generateResponse = await fetch(`${API_BASE_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceTTSText }),
      });

      const generateData = (await generateResponse.json()) as TTSGenerateResponse;

      if (generateData.success) {
        setTtsProgress(100);
        setGeneratedAudioUrl(generateData.audioUrl);
        setGeneratedAudioFile(generateData.fileName);
        setVoiceFile(null); // Clear uploaded file
        toast({
          title: 'Speech generated!',
          description: `Audio ready to send (${generateData.characterCount} characters)`,
        });

        // Auto-play preview
        const audio = new Audio(generateData.audioUrl);
        audio.play().catch(() => {
          // Silently fail if autoplay not allowed
        });
      } else {
        toast({
          title: 'Generation failed',
          description: generateData.message || 'Failed to generate speech',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate speech',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setTtsProgress(0), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Send SMS or Voice Messages</CardTitle>
          <CardDescription>
            Send SMS messages or initiate voice calls to recipients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient Phone Number</label>
            <Input
              placeholder="e.g., +9779862478859"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              type="tel"
            />
            <p className="text-xs text-gray-500">
              Use E.164 format: +[country code][number]
            </p>
          </div>

          {/* Message Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="sms"
                  checked={messageType === 'sms'}
                  onChange={(e) => setMessageType(e.target.value as 'sms' | 'call')}
                  disabled={loading}
                />
                <span>SMS Message</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="call"
                  checked={messageType === 'call'}
                  onChange={(e) => setMessageType(e.target.value as 'sms' | 'call')}
                  disabled={loading}
                />
                <span>Voice Call</span>
              </label>
            </div>
          </div>

          {/* SMS Content */}
          {messageType === 'sms' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Content</label>
              <Textarea
                placeholder="Enter your SMS message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Character count: {messageContent.length}
              </p>
            </div>
          )}

          {/* Voice Call Options */}
          {messageType === 'call' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Message Method</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceInputMethod"
                      value="tts"
                      checked={voiceInputMethod === 'tts'}
                      onChange={(e) => setVoiceInputMethod(e.target.value as 'tts' | 'upload' | 'twiml')}
                      disabled={loading}
                    />
                    <span>Generate from Text (AI Voice)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceInputMethod"
                      value="upload"
                      checked={voiceInputMethod === 'upload'}
                      onChange={(e) => setVoiceInputMethod(e.target.value as 'tts' | 'upload' | 'twiml')}
                      disabled={loading}
                    />
                    <span>Upload Audio File</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceInputMethod"
                      value="twiml"
                      checked={voiceInputMethod === 'twiml'}
                      onChange={(e) => setVoiceInputMethod(e.target.value as 'tts' | 'upload' | 'twiml')}
                      disabled={loading}
                    />
                    <span>TwiML URL</span>
                  </label>
                </div>
              </div>

              {/* Text-to-Speech Generator */}
              {voiceInputMethod === 'tts' && (
                <div className="space-y-3 border rounded-lg p-4 bg-blue-50">
                  <label className="text-sm font-medium">Enter Text to Convert to Speech</label>
                  <Textarea
                    placeholder="Enter the text you want to convert to speech. Max 5000 characters."
                    value={voiceTTSText}
                    onChange={(e) => setVoiceTTSText(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{voiceTTSText.length} / 5000 characters</span>
                    <span>Est. cost: ${estimatedCost.toFixed(4)}</span>
                  </div>
                  <Button
                    onClick={generateSpeechFromText}
                    disabled={loading || !voiceTTSText.trim()}
                    className="w-full"
                  >
                    {ttsProgress > 0 && ttsProgress < 100
                      ? `Generating... ${ttsProgress}%`
                      : '🎤 Generate Audio from Text'}
                  </Button>

                  {/* TTS Progress */}
                  {ttsProgress > 0 && ttsProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Generation Progress</span>
                        <span>{ttsProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${ttsProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generated Audio Preview */}
                  {generatedAudioUrl && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-medium text-green-900 mb-2">✓ Audio Generated</p>
                      <audio
                        controls
                        src={generatedAudioUrl}
                        className="w-full"
                      />
                      <p className="text-xs text-green-700 mt-2">
                        File: {generatedAudioFile}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Manual File Upload */}
              {voiceInputMethod === 'upload' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Voice Message</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceFileChange}
                      disabled={loading}
                      className="hidden"
                      id="voice-upload"
                    />
                    <label htmlFor="voice-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="text-4xl">🎤</div>
                        {voiceFile ? (
                          <>
                            <p className="font-medium text-green-600">{voiceFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(voiceFile.size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-500">MP3, WAV, OGG (Max 10MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TwiML URL */}
              {voiceInputMethod === 'twiml' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">TwiML URL</label>
                  <Input
                    placeholder="e.g., http://demo.twilio.com/docs/voice.xml"
                    value={voiceUrl}
                    onChange={(e) => setVoiceUrl(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    TwiML is XML markup that tells Twilio how to handle the call
                  </p>
                </div>
              )}
            </>
          )}

          {/* Response Data */}
          {responseData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-green-900">Response</h4>
              <div className="text-sm space-y-1 text-green-800">
                <p><strong>To:</strong> {responseData.to}</p>
                <p><strong>Status:</strong> {responseData.status}</p>
                {responseData.callSid && (
                  <p><strong>Call SID:</strong> {responseData.callSid}</p>
                )}
                {responseData.messageSid && (
                  <p><strong>Message SID:</strong> {responseData.messageSid}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {messageType === 'sms' ? (
              <Button
                onClick={sendSMS}
                disabled={loading || !phoneNumber || !messageContent}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send SMS'}
              </Button>
            ) : (
              <Button
                onClick={makeVoiceCall}
                disabled={
                  loading ||
                  !phoneNumber ||
                  (voiceInputMethod === 'tts' && !generatedAudioUrl) ||
                  (voiceInputMethod === 'upload' && !voiceFile) ||
                  (voiceInputMethod === 'twiml' && !voiceUrl)
                }
                className="flex-1"
              >
                {loading ? 'Initiating...' : 'Make Voice Call'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setPhoneNumber('');
                setMessageContent('');
                setVoiceTTSText('');
                setVoiceFile(null);
                setGeneratedAudioUrl(null);
                setGeneratedAudioFile(null);
                setResponseData(null);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Phone numbers should be in E.164 format (+country-number)</li>
              <li>SMS messages should not exceed 160 characters</li>
              <li>For voice calls, generate natural audio from text using AI Text-to-Speech</li>
              <li>Or upload your own pre-recorded audio file (MP3, WAV, OGG, max 10MB)</li>
              <li>Alternatively, provide a TwiML URL for advanced call handling</li>
              <li>Store the Call/Message SID to track status later</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageSender;
