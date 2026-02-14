import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CampaignContent {
  type: 'text' | 'voice';
  text?: string;
  voiceUrl?: string;
  voiceFile?: File;
  isGeneratedAudio?: boolean;
}

interface Campaign {
  name: string;
  content: CampaignContent;
  recipients: string[];
  scheduledFor?: string;
}

interface TTSGenerateResponse {
  success: boolean;
  audioUrl: string;
  fileName: string;
  characterCount: number;
  estimatedCost: number;
}

const VoiceCampaign: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<'text' | 'voice'>('text');
  const [voiceInputMethod, setVoiceInputMethod] = useState<'upload' | 'tts'>('tts');
  const [campaignName, setCampaignName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [voiceTTSText, setVoiceTTSText] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioFile, setGeneratedAudioFile] = useState<string | null>(null);
  const [recipientNumbers, setRecipientNumbers] = useState('');
  const [campaignResponse, setCampaignResponse] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const validateCampaignInput = (): boolean => {
    if (!campaignName.trim()) {
      toast({
        title: 'Missing campaign name',
        description: 'Please enter a campaign name',
        variant: 'destructive',
      });
      return false;
    }

    if (contentType === 'text' && !textContent.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter message text',
        variant: 'destructive',
      });
      return false;
    }

    if (contentType === 'voice' && !voiceFile && !generatedAudioUrl) {
      toast({
        title: 'No voice file',
        description: 'Please upload a voice file or generate one from text',
        variant: 'destructive',
      });
      return false;
    }

    if (!recipientNumbers.trim()) {
      toast({
        title: 'No recipients',
        description: 'Please enter at least one phone number',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const parsePhoneNumbers = (input: string): string[] => {
    return input
      .split('\n')
      .map((num) => num.trim())
      .filter((num) => num.length > 0);
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

  const startCampaign = async () => {
    if (!validateCampaignInput()) {
      return;
    }

    const phoneNumbers = parsePhoneNumbers(recipientNumbers);
    const fakeResult = {
      success: true,
      campaignId: `DEMO_${Date.now()}`,
      stats: {
        totalSent: phoneNumbers.length,
        successful: phoneNumbers.length,
        failed: 0,
      },
    };

    setCampaignResponse(fakeResult);
    toast({
      title: 'Done',
      description: `Campaign completed (demo) for ${phoneNumbers.length} recipients.`,
    });
  };

  const recipientList = parsePhoneNumbers(recipientNumbers);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Voice Campaign</CardTitle>
          <CardDescription>
            Send SMS or voice messages to multiple recipients at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <Input
              placeholder="e.g., Market Price Alert - Feb 14"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contentType"
                  value="text"
                  checked={contentType === 'text'}
                  onChange={(e) => setContentType(e.target.value as 'text' | 'voice')}
                  disabled={loading}
                />
                <span>Text Message (SMS)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contentType"
                  value="voice"
                  checked={contentType === 'voice'}
                  onChange={(e) => setContentType(e.target.value as 'text' | 'voice')}
                  disabled={loading}
                />
                <span>Voice Message (Call)</span>
              </label>
            </div>
          </div>

          {/* Text Content for SMS */}
          {contentType === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Text</label>
              <Textarea
                placeholder="Enter your SMS message here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                disabled={loading}
                rows={4}
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>One SMS = 160 characters</span>
                <span>
                  {textContent.length} / 160 characters
                  {Math.ceil(textContent.length / 160) > 1 &&
                    ` (${Math.ceil(textContent.length / 160)} SMS)`}
                </span>
              </div>
            </div>
          )}

          {/* Voice Message Options */}
          {contentType === 'voice' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Message Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceInputMethod"
                      value="tts"
                      checked={voiceInputMethod === 'tts'}
                      onChange={(e) => setVoiceInputMethod(e.target.value as 'upload' | 'tts')}
                      disabled={loading}
                    />
                    <span>Generate from Text (Text-to-Speech)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voiceInputMethod"
                      value="upload"
                      checked={voiceInputMethod === 'upload'}
                      onChange={(e) => setVoiceInputMethod(e.target.value as 'upload' | 'tts')}
                      disabled={loading}
                    />
                    <span>Upload Audio File</span>
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
                    rows={4}
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
            </>
          )}

          {/* Recipients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Phone Numbers</label>
              <Textarea
                placeholder="Enter phone numbers (one per line)&#10;+9779862478859&#10;+9779865432109"
                value={recipientNumbers}
                onChange={(e) => setRecipientNumbers(e.target.value)}
                disabled={loading}
                rows={6}
              />
              <p className="text-xs text-gray-500">
                Use E.164 format: +[country][number]
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Recipients List ({recipientList.length})
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                {recipientList.length > 0 ? (
                  <ul className="space-y-2">
                    {recipientList.map((num, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {num}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No recipients added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Campaign Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Campaign:</strong> {campaignName || 'Unnamed'}
              </p>
              <p>
                <strong>Type:</strong> {contentType === 'text' ? 'SMS' : 'Voice Call'}
              </p>
              {contentType === 'text' && (
                <p>
                  <strong>Message:</strong> {textContent.substring(0, 50)}
                  {textContent.length > 50 ? '...' : ''}
                </p>
              )}
              {contentType === 'voice' && (
                <p>
                  <strong>Voice File:</strong>{' '}
                  {generatedAudioFile || voiceFile?.name || 'Not selected'}
                </p>
              )}
              <p>
                <strong>Recipients:</strong> {recipientList.length} people
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Campaign Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Response */}
          {campaignResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ Campaign Completed</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  <strong>Campaign ID:</strong> {campaignResponse.campaignId}
                </p>
                <p>
                  <strong>Total Sent:</strong> {campaignResponse.stats.totalSent}
                </p>
                <p>
                  <strong>Successful:</strong> {campaignResponse.stats.successful}
                </p>
                {campaignResponse.stats.failed > 0 && (
                  <p>
                    <strong>Failed:</strong> {campaignResponse.stats.failed}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={startCampaign}
              disabled={
                loading ||
                !campaignName ||
                !recipientNumbers ||
                (contentType === 'text' && !textContent) ||
                (contentType === 'voice' && !voiceFile && !generatedAudioUrl)
              }
              className="flex-1"
            >
              {loading ? 'Starting Campaign...' : 'Start Campaign Now'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCampaignName('');
                setTextContent('');
                setVoiceTTSText('');
                setVoiceFile(null);
                setGeneratedAudioUrl(null);
                setGeneratedAudioFile(null);
                setRecipientNumbers('');
                setCampaignResponse(null);
                setCharacterCount(0);
                setEstimatedCost(0);
              }}
              disabled={loading}
            >
              Reset
            </Button>
          </div>

          {/* Tips & Help */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Tips</h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>SMS messages are limited to 160 characters per message</li>
              <li>Generate natural-sounding voice messages using AI Text-to-Speech</li>
              <li>Or upload your own pre-recorded audio file (MP3, WAV, OGG)</li>
              <li>Phone numbers must be in E.164 format (+country-number)</li>
              <li>Campaign will start immediately upon clicking "Start Campaign Now"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCampaign;
